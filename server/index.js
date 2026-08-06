import { app } from './app.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Cassava Village API running at http://localhost:${PORT}`);
});
