import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import answersRoutes from './routes/answers.js';
import teacherRoutes from './routes/classes.js';

export const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api', answersRoutes);
app.use('/api/teacher', teacherRoutes);

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (err?.code === '23503') {
    const isUserReference = String(err.constraint || '').includes('user_id');
    return isUserReference
      ? res.status(401).json({ error: 'Invalid or expired token' })
      : res.status(400).json({ error: 'Invalid reference' });
  }
  if (err?.code === '23505') {
    return res.status(409).json({ error: 'Conflict' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
