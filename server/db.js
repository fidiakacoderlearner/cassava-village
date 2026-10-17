import pg from 'pg';
import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { OPEN_STEP_IDS, EVAL_STEP_IDS, DRAG_FN, DRAG_COMBOS, DRAG_X, DRAG_BEST } from '../shared/constants.js';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required (Postgres connection string, e.g. Neon)');
}

const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
const sslMode = /[?&]sslmode=([^&]+)/.exec(process.env.DATABASE_URL)?.[1];

if (!isLocal && (sslMode === 'no-verify' || sslMode === 'disable')) {
  console.warn(`[db] TLS certificate verification is disabled by DATABASE_URL (sslmode=${sslMode})`);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  query_timeout: 30000,
  ssl: isLocal ? false : { rejectUnauthorized: true },
});

function toPostgres(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export const db = {
  exec(sql) {
    return pool.query(toPostgres(sql));
  },
  prepare(sql) {
    const query = toPostgres(sql);
    return {
      async get(...params) {
        const { rows } = await pool.query(query, params);
        return rows[0] ?? null;
      },
      async all(...params) {
        const { rows } = await pool.query(query, params);
        return rows;
      },
      async run(...params) {
        const { rows } = await pool.query(query, params);
        return { lastInsertRowid: rows[0]?.id ?? null };
      },
    };
  },
};

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    name             TEXT NOT NULL,
    email            TEXT NOT NULL UNIQUE,
    password_hash    TEXT NOT NULL,
    role             TEXT NOT NULL DEFAULT 'student',
    exploration_done INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS classes (
    id         SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    code       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE users ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL;

  CREATE TABLE IF NOT EXISTS answers (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_id    TEXT NOT NULL,
    answer     TEXT NOT NULL,
    is_correct INTEGER,
    class_id   INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, step_id, class_id)
  );

  CREATE TABLE IF NOT EXISTS exploration_attempts (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_no   INTEGER NOT NULL,
    class_id     INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, attempt_no)
  );

  ALTER TABLE exploration_attempts ADD COLUMN IF NOT EXISTS drag_answer TEXT;

  CREATE TABLE IF NOT EXISTS attempt_answers (
    id         SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES exploration_attempts(id) ON DELETE CASCADE,
    step_id    TEXT NOT NULL,
    answer     TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, step_id)
  );

  CREATE TABLE IF NOT EXISTS evaluation_attempts (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_no   INTEGER NOT NULL,
    class_id     INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, attempt_no)
  );

  CREATE TABLE IF NOT EXISTS evaluation_attempt_answers (
    id           SERIAL PRIMARY KEY,
    attempt_id   INTEGER NOT NULL REFERENCES evaluation_attempts(id) ON DELETE CASCADE,
    step_id      TEXT NOT NULL,
    answer       TEXT NOT NULL,
    answer_index INTEGER,
    is_correct   INTEGER,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, step_id)
  );

  CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
  CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_id);
  CREATE INDEX IF NOT EXISTS idx_answers_class ON answers(class_id);
  CREATE INDEX IF NOT EXISTS idx_exploration_attempts_user ON exploration_attempts(user_id);
  CREATE INDEX IF NOT EXISTS idx_exploration_attempts_class ON exploration_attempts(class_id);
  CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_user ON evaluation_attempts(user_id);
  CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_class ON evaluation_attempts(class_id);
  CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);
  CREATE INDEX IF NOT EXISTS idx_eval_answers_attempt ON evaluation_attempt_answers(attempt_id);
`;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEMO_CLASS_CODE = 'DEMOAB';

export function generateClassCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

async function seed() {
  const teacherEmail = 'teacher@cassava.com';
  let teacher = await db.prepare('SELECT id FROM users WHERE email = ?').get(teacherEmail);
  if (!teacher) {
    const info = await db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) RETURNING id'
    ).run('Ms. Sarah', teacherEmail, hash('teacher123'), 'teacher');
    teacher = { id: info.lastInsertRowid };
  }

  let demoClass = await db.prepare(
    'SELECT id FROM classes WHERE teacher_id = ? ORDER BY id LIMIT 1'
  ).get(teacher.id);
  if (!demoClass) {
    const info = await db.prepare(
      'INSERT INTO classes (teacher_id, name, code) VALUES (?, ?, ?) RETURNING id'
    ).run(teacher.id, 'XI-A', DEMO_CLASS_CODE);
    demoClass = { id: info.lastInsertRowid };
  }

  async function ensureStudent(email, password, name, explorationDone = 0) {
    let student = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!student) {
      const info = await db.prepare(
        'INSERT INTO users (name, email, password_hash, role, class_id, exploration_done) VALUES (?, ?, ?, ?, ?, ?) RETURNING id'
      ).run(name, email, hash(password), 'student', demoClass.id, explorationDone);
      student = { id: info.lastInsertRowid };
    } else {
      await db.prepare(
        'UPDATE users SET class_id = ?, exploration_done = GREATEST(exploration_done, ?) WHERE id = ?'
      ).run(demoClass.id, explorationDone, student.id);
    }
    return student.id;
  }

  async function seedAnswer(userId, stepId, answer, isCorrect = null, classId = null) {
    await db.prepare(
      `INSERT INTO answers (user_id, step_id, answer, is_correct, class_id) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (user_id, step_id, class_id) DO NOTHING`
    ).run(userId, stepId, answer, isCorrect == null ? null : (isCorrect ? 1 : 0), classId);
  }

  async function seedAttempt(userId, attemptNo, answersByStep, drag = null, classId = null) {
    const existing = await db.prepare(
      'SELECT COUNT(*) AS n FROM exploration_attempts WHERE user_id = ? AND attempt_no = ?'
    ).get(userId, attemptNo);
    if (existing.n > 0) return;
    const info = await db.prepare(
      'INSERT INTO exploration_attempts (user_id, attempt_no, drag_answer, class_id) VALUES (?, ?, ?, ?) RETURNING id'
    ).run(userId, attemptNo, drag ? JSON.stringify(drag) : null, classId);
    const ins = db.prepare('INSERT INTO attempt_answers (attempt_id, step_id, answer) VALUES (?, ?, ?)');
    for (const stepId of OPEN_STEP_IDS) {
      if (answersByStep[stepId]) await ins.run(info.lastInsertRowid, stepId, answersByStep[stepId]);
    }
  }

  async function seedEvalAttempt(userId, attemptNo, answersByStep, classId = null) {
    const existing = await db.prepare(
      'SELECT COUNT(*) AS n FROM evaluation_attempts WHERE user_id = ? AND attempt_no = ?'
    ).get(userId, attemptNo);
    if (existing.n > 0) return;
    const info = await db.prepare(
      'INSERT INTO evaluation_attempts (user_id, attempt_no, class_id) VALUES (?, ?, ?) RETURNING id'
    ).run(userId, attemptNo, classId);
    const ins = db.prepare('INSERT INTO evaluation_attempt_answers (attempt_id, step_id, answer, answer_index, is_correct) VALUES (?, ?, ?, ?, ?)');
    for (const stepId of EVAL_STEP_IDS) {
      const e = answersByStep[stepId];
      if (e) await ins.run(info.lastInsertRowid, stepId, e.answer, e.answerIndex ?? null, e.isCorrect ? 1 : 0);
    }
  }

  const githa = await ensureStudent('student@cassava.com', 'student123', 'Githa Sayang', 1);
  const budi = await ensureStudent('budi@cassava.com', 'budi123', 'Budi Santoso', 1);
  await ensureStudent('siti@cassava.com', 'siti123', 'Siti Aminah');

  const GITHA_ESSAYS = {
    'open-gof-machines': '(g ∘ f)(x) = 0,765x − 0,5',
    'open-gof-money': '(g ∘ f)(x) = 0,75x − 80.000',
    'open-fog-money': '(f ∘ g)(x) = 0,75x − 60.000',
    'open-restu-calc': 'Pendapatan bersih Pak Restu = Rp300.000 − Rp80.000 = Rp220.000',
    'open-rafif-calc': 'Pendapatan bersih Pak Rafif = Rp300.000 − Rp60.000 = Rp240.000',
    'open-difference-explanation': 'Pak Restu menerima Rp220.000 sedangkan Pak Rafif Rp240.000. Selisih Rp20.000 terjadi karena urutan komposisi berbeda.',
    'open-conclusion': 'Komposisi fungsi umumnya tidak komutatif: (g ∘ f)(x) ≠ (f ∘ g)(x).',
  };

  const BUDI_ESSAYS_1 = {
    'open-gof-machines': 'Singkong dikupas dulu lalu dicuci',
    'open-gof-money': '(g ∘ f)(x) = 0,75x − 80.000',
    'open-fog-money': '(f ∘ g)(x) = 0,75x − 60.000',
    'open-restu-calc': 'Rp220.000',
    'open-rafif-calc': 'Rp240.000',
    'open-difference-explanation': 'Hasilnya berbeda karena urutan pengerjaan dibalik',
    'open-conclusion': 'Komposisi fungsi tidak selalu komutatif',
  };

  const BUDI_ESSAYS_2 = {
    'open-gof-machines': '(g ∘ f)(x) = 0,765x − 0,5',
    'open-gof-money': '(g ∘ f)(x) = 0,75x − 80.000',
    'open-fog-money': '(f ∘ g)(x) = 0,75x − 60.000',
    'open-restu-calc': '(g ∘ f)(400.000) = 300.000 − 80.000 = Rp220.000',
    'open-rafif-calc': '(f ∘ g)(400.000) = 300.000 − 60.000 = Rp240.000',
    'open-difference-explanation': 'Selisih Rp20.000: Rp240.000 − Rp220.000, karena komposisi tidak komutatif.',
    'open-conclusion': '(g ∘ f) ≠ (f ∘ g), urutan komposisi menentukan hasil akhir.',
  };

  await seedAttempt(githa, 1, GITHA_ESSAYS, { slot1: 'g1', slot2: 'f2', result: 912000 }, demoClass.id);
  await seedAttempt(budi, 1, BUDI_ESSAYS_1, { slot1: 'f2', slot2: 'g2', result: 855000 }, demoClass.id);
  await seedAttempt(budi, 2, BUDI_ESSAYS_2, { slot1: 'g1', slot2: 'f2', result: 912000 }, demoClass.id);

  const GITHA_EVAL = {
    'eval-1': { answer: 'S(x) = 0.92x, D(x) = x − 0.6', answerIndex: 0, isCorrect: true },
    'eval-2': { answer: '(D ∘ S)(x) = 0.92x − 0.6', answerIndex: 1, isCorrect: true },
    'eval-3': { answer: '22.4 kg', answerIndex: 1, isCorrect: true },
    'eval-4': { answer: '(D ∘ S)(25) is smaller than (S ∘ D)(25) by 0.048 kg', answerIndex: 2, isCorrect: true },
    'eval-5': { answer: '(D ∘ S)(x) ≠ (S ∘ D)(x) in general, meaning function composition is not commutative — the order of the machines affects the final result.', answerIndex: 1, isCorrect: true },
  };
  const BUDI_EVAL_1 = {
    'eval-1': { answer: 'S(x) = 0.92x, D(x) = x − 0.6', answerIndex: 0, isCorrect: true },
    'eval-2': { answer: '(D ∘ S)(x) = 1.52x', answerIndex: 0, isCorrect: false },
    'eval-3': { answer: '22.4 kg', answerIndex: 1, isCorrect: true },
    'eval-4': { answer: 'Both compositions give exactly the same result', answerIndex: 4, isCorrect: false },
    'eval-5': { answer: '(D ∘ S)(x) ≠ (S ∘ D)(x) in general, meaning function composition is not commutative — the order of the machines affects the final result.', answerIndex: 1, isCorrect: true },
  };

  await seedEvalAttempt(githa, 1, GITHA_EVAL, demoClass.id);
  await seedEvalAttempt(budi, 1, BUDI_EVAL_1, demoClass.id);
  await seedEvalAttempt(budi, 2, GITHA_EVAL, demoClass.id);

  for (const id of EVAL_STEP_IDS) {
    await seedAnswer(githa, id, 'ok', 1, demoClass.id);
    await seedAnswer(budi, id, 'ok', 1, demoClass.id);
  }
  await seedAnswer(githa, 'quiz-peel', '7,225 kg', 1, demoClass.id);
  await seedAnswer(githa, 'quiz-wash', '6,0025 kg', 1, demoClass.id);
  await seedAnswer(githa, 'quiz-discount', 'f(x) = 0,75x', 1, demoClass.id);
  await seedAnswer(githa, 'quiz-retribution', 'g(x) = x − 80.000', 1, demoClass.id);
  await seedAnswer(budi, 'quiz-peel', '7,055 kg', 0, demoClass.id);
}

async function backfillDragAnswers() {
  const rows = await db.prepare(`
    SELECT ea.id
    FROM exploration_attempts ea
    WHERE (ea.drag_answer IS NULL OR ea.drag_answer = '')
      AND EXISTS (SELECT 1 FROM attempt_answers aa WHERE aa.attempt_id = ea.id)
  `).all();
  if (rows.length === 0) return;
  const upd = db.prepare('UPDATE exploration_attempts SET drag_answer = ? WHERE id = ?');
  for (const { id } of rows) {
    const c = DRAG_COMBOS[randomInt(DRAG_COMBOS.length)];
    const result = Math.round(DRAG_FN[c.slot2](DRAG_FN[c.slot1](DRAG_X)));
    await upd.run(JSON.stringify({ ...c, result }), id);
  }
  console.log(`[db] backfilled ${rows.length} missing drag answers`);
}

async function backfillEmptyEssays() {
  const attempts = await db.prepare(`
    SELECT ea.id, ea.user_id, ea.attempt_no
    FROM exploration_attempts ea
    WHERE (
      SELECT COUNT(*) FROM attempt_answers aa WHERE aa.attempt_id = ea.id
    ) < 7
    OR EXISTS (
      SELECT 1 FROM attempt_answers aa2
      WHERE aa2.attempt_id = ea.id
        AND (TRIM(aa2.answer) = '' OR aa2.answer LIKE '(jawaban kosong)%')
    )
  `).all();
  if (attempts.length === 0) return;
  const ids = attempts.map((a) => a.id);
  const ph = ids.map(() => '?').join(',');
  await db.prepare(`DELETE FROM attempt_answers WHERE attempt_id IN (${ph})`).run(...ids);
  await db.prepare(`DELETE FROM exploration_attempts WHERE id IN (${ph})`).run(...ids);
  console.log(`[db] removed ${ids.length} incomplete exploration attempts`);
}

async function renumberAttempts() {
  const expUsers = await db.prepare(
    'SELECT DISTINCT user_id FROM exploration_attempts ORDER BY user_id'
  ).all();
  for (const { user_id } of expUsers) {
    const rows = await db.prepare(
      'SELECT id FROM exploration_attempts WHERE user_id = ? ORDER BY submitted_at, id'
    ).all(user_id);
    for (let i = 0; i < rows.length; i++) {
      await db.prepare(
        'UPDATE exploration_attempts SET attempt_no = ? WHERE id = ?'
      ).run(i + 1, rows[i].id);
    }
  }

  const evalUsers = await db.prepare(
    'SELECT DISTINCT user_id FROM evaluation_attempts ORDER BY user_id'
  ).all();
  for (const { user_id } of evalUsers) {
    const rows = await db.prepare(
      'SELECT id FROM evaluation_attempts WHERE user_id = ? ORDER BY submitted_at, id'
    ).all(user_id);
    for (let i = 0; i < rows.length; i++) {
      await db.prepare(
        'UPDATE evaluation_attempts SET attempt_no = ? WHERE id = ?'
      ).run(i + 1, rows[i].id);
    }
  }
  console.log('[db] renumbered all attempt numbers sequentially');
}

async function migrateDb() {
  await db.exec('ALTER TABLE evaluation_attempt_answers ADD COLUMN IF NOT EXISTS answer_index INTEGER');
  await db.exec('ALTER TABLE answers ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL');
  await db.exec('ALTER TABLE exploration_attempts ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL');
  await db.exec('ALTER TABLE evaluation_attempts ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL');
  try { await db.exec('ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_user_id_step_key'); } catch { /* ignore */ }
  try { await db.exec('ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_user_id_step_id_key'); } catch { /* ignore */ }
  try { await db.exec('ALTER TABLE answers ADD CONSTRAINT answers_user_step_class UNIQUE (user_id, step_id, class_id)'); } catch { /* ignore */ }
  await db.exec('CREATE INDEX IF NOT EXISTS idx_answers_class ON answers(class_id)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_exploration_attempts_class ON exploration_attempts(class_id)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_class ON evaluation_attempts(class_id)');
  await db.exec(`
    UPDATE answers SET class_id = u.class_id FROM users u WHERE answers.user_id = u.id AND answers.class_id IS NULL AND u.class_id IS NOT NULL
  `);
  await db.exec(`
    UPDATE exploration_attempts SET class_id = u.class_id FROM users u WHERE exploration_attempts.user_id = u.id AND exploration_attempts.class_id IS NULL AND u.class_id IS NOT NULL
  `);
  await db.exec(`
    UPDATE evaluation_attempts SET class_id = u.class_id FROM users u WHERE evaluation_attempts.user_id = u.id AND evaluation_attempts.class_id IS NULL AND u.class_id IS NOT NULL
  `);
  console.log('[db] migrations applied');
}

async function initDb() {
  await db.exec(SCHEMA);
  await migrateDb();
  await seed();
  await backfillDragAnswers();
  await backfillEmptyEssays();
  await renumberAttempts();
}

export { initDb };

// Always run migrations (safe, idempotent — runs on every server start)
await migrateDb();

// Only auto-initialize in local dev or when explicitly opted in
// On Vercel (serverless), skip to avoid cold-start penalty
const shouldInit = isLocal || process.env.INIT_DB === '1';

if (shouldInit) {
  await initDb();
}
