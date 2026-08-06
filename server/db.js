import pg from 'pg';
import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { OPEN_STEP_IDS, EVAL_STEP_IDS } from './constants.js';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required (Postgres connection string, e.g. Neon)');
}

const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: isLocal ? false : { rejectUnauthorized: false },
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
    about_done       INTEGER NOT NULL DEFAULT 0,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, step_id)
  );

  CREATE TABLE IF NOT EXISTS exploration_attempts (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_no   INTEGER NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, attempt_no)
  );

  CREATE TABLE IF NOT EXISTS attempt_answers (
    id         SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES exploration_attempts(id) ON DELETE CASCADE,
    step_id    TEXT NOT NULL,
    answer     TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, step_id)
  );
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

  async function ensureStudent(email, password, name, aboutDone = 0, explorationDone = 0) {
    let student = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!student) {
      const info = await db.prepare(
        'INSERT INTO users (name, email, password_hash, role, class_id, about_done, exploration_done) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id'
      ).run(name, email, hash(password), 'student', demoClass.id, aboutDone, explorationDone);
      student = { id: info.lastInsertRowid };
    } else {
      await db.prepare(
        'UPDATE users SET class_id = ?, about_done = GREATEST(about_done, ?), exploration_done = GREATEST(exploration_done, ?) WHERE id = ?'
      ).run(demoClass.id, aboutDone, explorationDone, student.id);
    }
    return student.id;
  }

  async function seedAnswer(userId, stepId, answer, isCorrect = null) {
    await db.prepare(
      `INSERT INTO answers (user_id, step_id, answer, is_correct) VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id, step_id) DO NOTHING`
    ).run(userId, stepId, answer, isCorrect == null ? null : (isCorrect ? 1 : 0));
  }

  async function seedAttempt(userId, attemptNo, answersByStep) {
    const existing = await db.prepare(
      'SELECT COUNT(*) AS n FROM exploration_attempts WHERE user_id = ? AND attempt_no = ?'
    ).get(userId, attemptNo);
    if (existing.n > 0) return;
    const info = await db.prepare(
      'INSERT INTO exploration_attempts (user_id, attempt_no) VALUES (?, ?) RETURNING id'
    ).run(userId, attemptNo);
    const ins = db.prepare('INSERT INTO attempt_answers (attempt_id, step_id, answer) VALUES (?, ?, ?)');
    for (const stepId of OPEN_STEP_IDS) {
      if (answersByStep[stepId]) await ins.run(info.lastInsertRowid, stepId, answersByStep[stepId]);
    }
  }

  const githa = await ensureStudent('student@cassava.com', 'student123', 'Githa Sayang', 1, 1);
  const budi = await ensureStudent('budi@cassava.com', 'budi123', 'Budi Santoso', 1, 1);
  await ensureStudent('siti@cassava.com', 'siti123', 'Siti Aminah', 0);

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

  await seedAttempt(githa, 1, GITHA_ESSAYS);
  await seedAttempt(budi, 1, BUDI_ESSAYS_1);
  await seedAttempt(budi, 2, BUDI_ESSAYS_2);
  for (const id of EVAL_STEP_IDS) {
    await seedAnswer(githa, id, 'ok', 1);
    await seedAnswer(budi, id, 'ok', 1);
  }
  await seedAnswer(githa, 'quiz-peel', '7,225 kg', 1);
  await seedAnswer(githa, 'quiz-wash', '6,0025 kg', 1);
  await seedAnswer(githa, 'quiz-discount', 'f(x) = 0,75x', 1);
  await seedAnswer(githa, 'quiz-retribution', 'g(x) = x − 80.000', 1);
  await seedAnswer(budi, 'quiz-peel', '7,055 kg', 0);
}

export async function initDb() {
  await db.exec(SCHEMA);
  await seed();
}

await initDb();
