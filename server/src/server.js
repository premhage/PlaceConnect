import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedInitialData } from './utils/seedHelper.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    // Auto-seed initial demo data if database is fresh and empty
    await seedInitialData(false);

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` PlaceConnect Backend Server Running on Port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`====================================================`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error('[Unhandled Rejection]:', err.message);
      // Keep running in development or close gracefully
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Server] SIGTERM received. Closing HTTP server...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
      });
    });
  } catch (error) {
    console.error('[Server] Critical startup failure:', error.message);
    process.exit(1);
  }
};

startServer();
