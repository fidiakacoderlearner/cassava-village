import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, asyncHandler } from '../middleware/auth.js';
import { OPEN_STEP_IDS, EVAL_STEP_IDS, EXPLORE_STEP_IDS, TOTAL_OPEN_STEPS, DRAG_FN, DRAG_X } from '../../shared/constants.js';

const router = Router();

router.use(requireAuth);

async function getUserClassId(userId) {
  const u = await db.prepare('SELECT class_id FROM users WHERE id = ?').get(userId);
  return u?.class_id ?? null;
}

router.post('/answers', asyncHandler(async (req, res) => {
  const { stepId, answer, isCorrect } = req.body || {};
  if (!stepId || answer == null) {
    return res.status(400).json({ error: 'stepId and answer are required' });
  }
  if (OPEN_STEP_IDS.includes(String(stepId))) {
    return res.status(400).json({ error: 'Essay answers must be submitted via /api/exploration/submit' });
  }
  const classId = await getUserClassId(req.user.id);

  await db.prepare(`
    INSERT INTO answers (user_id, step_id, answer, is_correct, class_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (user_id, step_id, class_id) DO UPDATE SET
      answer = excluded.answer,
      is_correct = excluded.is_correct,
      updated_at = now()
  `).run(req.user.id, String(stepId), String(answer), isCorrect == null ? null : (isCorrect ? 1 : 0), classId);

  res.json({ ok: true });
}));

router.post('/exploration/submit', asyncHandler(async (req, res) => {
  const { answers, drag } = req.body || {};
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'answers are required' });
  }
  const missing = OPEN_STEP_IDS.filter((id) => !String(answers[id] || '').trim());
  if (missing.length > 0) {
    return res.status(400).json({ error: 'All exploration essays must be answered' });
  }

  if (!drag || !drag.slot1 || !DRAG_FN[drag.slot1] || !drag.slot2 || !DRAG_FN[drag.slot2]) {
    return res.status(400).json({ error: 'Drag answer is required' });
  }
  const result = Math.round(DRAG_FN[drag.slot2](DRAG_FN[drag.slot1](DRAG_X)));
  const dragJson = JSON.stringify({ slot1: drag.slot1, slot2: drag.slot2, result });

  const classId = await getUserClassId(req.user.id);
  const current = await db.prepare(
    'SELECT COALESCE(MAX(attempt_no), 0) AS n FROM exploration_attempts WHERE user_id = ? AND class_id IS NOT DISTINCT FROM ?'
  ).get(req.user.id, classId);
  const attemptNo = current.n + 1;
  const info = await db.prepare(
    'INSERT INTO exploration_attempts (user_id, attempt_no, drag_answer, class_id) VALUES (?, ?, ?, ?) RETURNING id'
  ).run(req.user.id, attemptNo, dragJson, classId);
  const ins = db.prepare('INSERT INTO attempt_answers (attempt_id, step_id, answer) VALUES (?, ?, ?)');
  for (const stepId of OPEN_STEP_IDS) {
    await ins.run(info.lastInsertRowid, stepId, String(answers[stepId]).trim());
  }

  res.status(201).json({ ok: true, attemptNo });
}));

router.post('/evaluation/submit', asyncHandler(async (req, res) => {
  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers are required' });
  }
  const map = {};
  for (const a of answers) {
    if (a && EVAL_STEP_IDS.includes(String(a.stepId)) && a.answer != null) {
      map[String(a.stepId)] = { answer: String(a.answer), answerIndex: a.answerIndex ?? null, isCorrect: a.isCorrect ? 1 : 0 };
    }
  }
  const missing = EVAL_STEP_IDS.filter((id) => !map[id]);
  if (missing.length > 0) {
    return res.status(400).json({ error: 'All evaluation questions must be answered' });
  }

  const classId = await getUserClassId(req.user.id);
  const upsert = db.prepare(`
    INSERT INTO answers (user_id, step_id, answer, is_correct, class_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (user_id, step_id, class_id) DO UPDATE SET
      answer = excluded.answer,
      is_correct = excluded.is_correct,
      updated_at = now()
  `);
  for (const stepId of EVAL_STEP_IDS) {
    await upsert.run(req.user.id, stepId, map[stepId].answer, map[stepId].isCorrect, classId);
  }

  const current = await db.prepare(
    'SELECT COALESCE(MAX(attempt_no), 0) AS n FROM evaluation_attempts WHERE user_id = ? AND class_id IS NOT DISTINCT FROM ?'
  ).get(req.user.id, classId);
  const attemptNo = current.n + 1;
  const info = await db.prepare(
    'INSERT INTO evaluation_attempts (user_id, attempt_no, class_id) VALUES (?, ?, ?) RETURNING id'
  ).run(req.user.id, attemptNo, classId);
  const ins = db.prepare('INSERT INTO evaluation_attempt_answers (attempt_id, step_id, answer, answer_index, is_correct) VALUES (?, ?, ?, ?, ?)');
  for (const stepId of EVAL_STEP_IDS) {
    await ins.run(info.lastInsertRowid, stepId, map[stepId].answer, map[stepId].answerIndex, map[stepId].isCorrect);
  }

  res.status(201).json({ ok: true, attemptNo });
}));

router.get('/answers', asyncHandler(async (req, res) => {
  const classId = await getUserClassId(req.user.id);
  const rows = await db.prepare(
    'SELECT step_id, answer, is_correct, updated_at FROM answers WHERE user_id = ? AND class_id IS NOT DISTINCT FROM ? ORDER BY updated_at'
  ).all(req.user.id, classId);
  res.json({ answers: rows });
}));

router.get('/progress/me', asyncHandler(async (req, res) => {
  const user = await db.prepare('SELECT exploration_done FROM users WHERE id = ?').get(req.user.id);
  const classId = await getUserClassId(req.user.id);

  const rows = await db.prepare(
    'SELECT step_id, answer, is_correct FROM answers WHERE user_id = ? AND class_id IS NOT DISTINCT FROM ?'
  ).all(req.user.id, classId);
  const byStep = {};
  const evalDone = new Set();
  let correct = 0;
  for (const r of rows) {
    byStep[r.step_id] = r;
    if (EVAL_STEP_IDS.includes(r.step_id)) evalDone.add(r.step_id);
    if (r.is_correct) correct += 1;
  }

  const openRow = await db.prepare(
    `SELECT COUNT(*)::int AS n FROM attempt_answers aa
     JOIN exploration_attempts ea ON ea.id = aa.attempt_id
     WHERE ea.user_id = ? AND ea.class_id IS NOT DISTINCT FROM ?`
  ).get(req.user.id, classId);
  const openAnswered = openRow.n;

  const hasExplorationAttempt = await db.prepare(
    'SELECT 1 FROM exploration_attempts WHERE user_id = ? AND class_id IS NOT DISTINCT FROM ? LIMIT 1'
  ).get(req.user.id, classId);
  const explorationDone = Boolean(hasExplorationAttempt) || openAnswered >= TOTAL_OPEN_STEPS;

  res.json({
    totalOpenSteps: TOTAL_OPEN_STEPS,
    openAnswered,
    correctAnswers: correct,
    steps: byStep,
    explorationDone,
    evaluationUnlocked: true,
    evaluationDone: evalDone.size >= EVAL_STEP_IDS.length,
  });
}));

router.post('/progress/reset-exploration', asyncHandler(async (req, res) => {
  const classId = await getUserClassId(req.user.id);
  const placeholders = EXPLORE_STEP_IDS.map(() => '?').join(', ');
  await db.prepare(
    `DELETE FROM answers WHERE user_id = ? AND class_id IS NOT DISTINCT FROM ? AND step_id IN (${placeholders})`
  ).run(req.user.id, classId, ...EXPLORE_STEP_IDS);
  res.json({ ok: true });
}));

export default router;
