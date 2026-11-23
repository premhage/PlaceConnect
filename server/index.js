import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { seedInitialData } from './src/utils/seedHelper.js';

let initPromise = null;

const init = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await seedInitialData(false);
    })().catch((err) => {
      initPromise = null; // Allow retry on subsequent requests
      throw err;
    });
  }
  return initPromise;
};

// Initiate connection on container start
init().catch(() => {});

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  // Allow health check without blocking if database status is being inspected
  if (req.path === '/api/v1/health') {
    return next();
  }

  try {
    await init();
    next();
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed: ' + (err.message || 'Unable to connect to MongoDB Atlas'),
      hint: 'Please verify MONGODB_URI in Vercel Environment Variables and ensure password has no unencoded special characters.',
    });
  }
});

// Standalone execution if started directly (e.g., node index.js)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[PlaceConnect] Server running on port ${PORT}`);
  });
}

export default app;
