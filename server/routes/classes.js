import { Router } from 'express';
import { db, generateClassCode } from '../db.js';
import { requireAuth, requireTeacher, asyncHandler } from '../middleware/auth.js';
import { TOTAL_OPEN_STEPS } from '../constants.js';

const router = Router();

router.use(requireAuth, requireTeacher);

async function uniqueCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = generateClassCode();
    const exists = await db.prepare('SELECT id FROM classes WHERE code = ?').get(code);
    if (!exists) return code;
  }
  throw new Error('Could not generate a unique class code');
}

router.get('/classes', asyncHandler(async (req, res) => {
  const rows = await db.prepare(`
    SELECT c.id, c.name, c.code, c.created_at,
           (SELECT COUNT(*)::int FROM users u WHERE u.role = 'student' AND u.class_id = c.id) AS student_count
    FROM classes c
    WHERE c.teacher_id = ?
    ORDER BY c.created_at DESC, c.id DESC
  `).all(req.user.id);
  res.json({ classes: rows });
}));

router.post('/classes', asyncHandler(async (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Class name is required' });
  }
  const code = await uniqueCode();
  const info = await db.prepare(
    'INSERT INTO classes (teacher_id, name, code) VALUES (?, ?, ?) RETURNING id'
  ).run(req.user.id, String(name).trim(), code);
  const cls = await db.prepare('SELECT id, name, code, created_at FROM classes WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ class: cls });
}));

router.get('/classes/:id/students', asyncHandler(async (req, res) => {
  const cls = await db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  res.json({ students: await fetchStudents(Number(req.params.id)) });
}));

router.get('/classes/:id/essay-answers', asyncHandler(async (req, res) => {
  const cls = await db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  res.json({ students: await fetchEssays(Number(req.params.id)) });
}));

router.get('/classes/:id/evaluation-answers', asyncHandler(async (req, res) => {
  const cls = await db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  res.json({ students: await fetchEvaluations(Number(req.params.id)) });
}));

router.get('/classes/:id/summary', asyncHandler(async (req, res) => {
  const cls = await db.prepare(`
    SELECT c.id, c.name, c.code, c.created_at,
           (SELECT COUNT(*)::int FROM users u WHERE u.role = 'student' AND u.class_id = c.id) AS student_count
    FROM classes c
    WHERE c.id = ? AND c.teacher_id = ?
  `).get(Number(req.params.id), req.user.id);
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  const [students, essays, evaluations] = await Promise.all([
    fetchStudents(Number(req.params.id)),
    fetchEssays(Number(req.params.id)),
    fetchEvaluations(Number(req.params.id)),
  ]);

  res.json({ class: cls, students, essays, evaluations });
}));

async function fetchStudents(classId) {
  const rows = await db.prepare(`
    SELECT u.id, u.name, u.email, u.about_done, u.exploration_done, u.created_at,
           COUNT(a.id)::int                                                        AS total_answers,
           COALESCE(SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END), 0)::int     AS correct_answers,
           (SELECT COUNT(*)::int FROM exploration_attempts ea WHERE ea.user_id = u.id) AS open_done,
           (SELECT COUNT(*)::int FROM evaluation_attempts ea2 WHERE ea2.user_id = u.id) AS eval_count
    FROM users u
    LEFT JOIN answers a ON a.user_id = u.id
    WHERE u.role = 'student' AND u.class_id = ?
    GROUP BY u.id
    ORDER BY u.name
  `).all(classId);

  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    aboutDone: Boolean(s.about_done),
    explorationDone: Boolean(s.exploration_done),
    joined: s.created_at,
    totalAnswers: s.total_answers,
    correctAnswers: s.correct_answers,
    openDone: s.exploration_done ? TOTAL_OPEN_STEPS : s.open_done,
    explorationCount: s.open_done ?? 0,
    evalCount: s.eval_count ?? 0,
    scorePercent: s.total_answers > 0 ? Math.round((s.correct_answers / s.total_answers) * 100) : 0,
  }));
}

async function fetchEssays(classId) {
  const rows = await db.prepare(`
    SELECT u.id                                 AS user_id,
           u.name,
           u.email,
           u.exploration_done,
           ea.attempt_no,
           to_char(ea.submitted_at, 'YYYY-MM-DD HH24:MI:SS') AS submitted_at,
           ea.drag_answer,
           aa.step_id,
           aa.answer
    FROM users u
    LEFT JOIN exploration_attempts ea ON ea.user_id = u.id
    LEFT JOIN attempt_answers aa ON aa.attempt_id = ea.id
    WHERE u.role = 'student' AND u.class_id = ?
    ORDER BY u.name, ea.attempt_no
  `).all(classId);

  const byUser = {};
  for (const r of rows) {
    if (!byUser[r.user_id]) {
      byUser[r.user_id] = {
        id: r.user_id,
        name: r.name,
        email: r.email,
        explorationDone: Boolean(r.exploration_done),
        attempts: [],
      };
    }
    if (r.attempt_no == null) continue;
    let attempt = byUser[r.user_id].attempts.find((a) => a.attemptNo === r.attempt_no);
    if (!attempt) {
      attempt = { attemptNo: r.attempt_no, submittedAt: r.submitted_at, essays: [], drag: null };
      if (r.drag_answer) {
        try {
          attempt.drag = JSON.parse(r.drag_answer);
        } catch {
          /* ignore malformed drag */
        }
      }
      byUser[r.user_id].attempts.push(attempt);
    }
    if (r.step_id) {
      attempt.essays.push({ stepId: r.step_id, answer: r.answer });
    }
  }

  return Object.values(byUser);
}

async function fetchEvaluations(classId) {
  const rows = await db.prepare(`
    SELECT u.id AS user_id,
           u.name,
           u.email,
           ea.attempt_no,
           to_char(ea.submitted_at, 'YYYY-MM-DD HH24:MI:SS') AS submitted_at,
           aa.step_id,
           aa.answer,
           aa.answer_index,
           aa.is_correct
    FROM users u
    LEFT JOIN evaluation_attempts ea ON ea.user_id = u.id
    LEFT JOIN evaluation_attempt_answers aa ON aa.attempt_id = ea.id
    WHERE u.role = 'student' AND u.class_id = ?
    ORDER BY u.name, ea.attempt_no
  `).all(classId);

  const byUser = {};
  for (const r of rows) {
    if (!byUser[r.user_id]) {
      byUser[r.user_id] = {
        id: r.user_id,
        name: r.name,
        email: r.email,
        attempts: [],
      };
    }
    if (r.attempt_no == null) continue;
    let attempt = byUser[r.user_id].attempts.find((a) => a.attemptNo === r.attempt_no);
    if (!attempt) {
      attempt = { attemptNo: r.attempt_no, submittedAt: r.submitted_at, answers: {}, correctCount: 0 };
      byUser[r.user_id].attempts.push(attempt);
    }
    if (r.step_id) {
      attempt.answers[r.step_id] = { answer: r.answer, answerIndex: r.answer_index, isCorrect: Boolean(r.is_correct) };
      if (r.is_correct) attempt.correctCount += 1;
    }
  }

  return Object.values(byUser);
}

export default router;
