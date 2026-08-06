import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import answersRoutes from './routes/answers.js';
import teacherRoutes from './routes/classes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api', answersRoutes);
app.use('/api/teacher', teacherRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
