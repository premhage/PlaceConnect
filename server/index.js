import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { seedInitialData } from './src/utils/seedHelper.js';

let isInitialized = false;

const init = async () => {
  if (!isInitialized) {
    try {
      await connectDB();
      await seedInitialData(false);
      isInitialized = true;
    } catch (err) {
      console.error('[Server] DB init warning:', err.message);
    }
  }
};

// Initiate on load
init();

// Ensure DB is ready on each serverless invocation
app.use(async (req, res, next) => {
  await init();
  next();
});

// Standalone execution if started directly (e.g., node index.js)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[PlaceConnect] Server running on port ${PORT}`);
  });
}

export default app;
