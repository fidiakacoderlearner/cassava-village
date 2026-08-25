import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, publicUser, requireAuth, asyncHandler } from '../middleware/auth.js';

const router = Router();

router.post('/signup', asyncHandler(async (req, res) => {
  const { name, email, password, classCode, role } = req.body || {};
  const targetRole = role === 'teacher' ? 'teacher' : 'student';
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (targetRole === 'student' && !classCode) {
    return res.status(400).json({ error: 'Invalid class code' });
  }
  if (typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  let classId = null;
  if (targetRole === 'student') {
    const cls = await db.prepare('SELECT id FROM classes WHERE code = ?').get(String(classCode).trim().toUpperCase());
    if (!cls) {
      return res.status(400).json({ error: 'Invalid class code' });
    }
    classId = cls.id;
  }
  const exists = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email is already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const info = await db.prepare(
    'INSERT INTO users (name, email, password_hash, role, class_id) VALUES (?, ?, ?, ?, ?) RETURNING id'
  ).run(name.trim(), email.trim().toLowerCase(), hash, targetRole, classId);

  const user = await db.prepare('SELECT id, name, email, role, class_id FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.post('/join-class', requireAuth, asyncHandler(async (req, res) => {
  const { classCode } = req.body || {};
  if (!classCode || typeof classCode !== 'string') {
    return res.status(400).json({ error: 'Class code is required' });
  }
  const normalizedCode = classCode.trim().toUpperCase();
  const cls = await db.prepare('SELECT id FROM classes WHERE code = ?').get(normalizedCode);
  if (!cls) {
    console.log('[auth] join-class: class not found', { userId: req.user.id, classCode: normalizedCode });
    return res.status(400).json({ error: 'Invalid class code' });
  }
  await db.prepare('UPDATE users SET class_id = ? WHERE id = ? AND role = ?').run(cls.id, req.user.id, 'student');
  const user = await db.prepare('SELECT id, name, email, role, class_id FROM users WHERE id = ?').get(req.user.id);
  if (!user || user.class_id !== cls.id) {
    console.log('[auth] join-class: update failed (user not updated)', { userId: req.user.id, classCode: normalizedCode, classId: cls.id, actualClassId: user?.class_id });
    return res.status(400).json({ error: 'Failed to join class. Please try again.' });
  }
  console.log('[auth] join-class: success', { userId: req.user.id, classCode: normalizedCode, classId: cls.id, newClassId: user.class_id });
  res.json({ user: publicUser(user) });
}));

export default router;
