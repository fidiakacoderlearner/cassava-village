import { initDb } from './db.js';

await initDb();
console.log('[init-db] Database initialized successfully');