import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongodInstance = null;

export const connectDB = async () => {
  // Return existing connection in serverless / repeated calls
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri && process.env.VERCEL) {
    const missingUriErr = new Error(
      'MONGODB_URI environment variable is missing in Vercel Project Settings.'
    );
    console.error('[Database]', missingUriErr.message);
    throw missingUriErr;
  }

  const targetUri = uri || 'mongodb://127.0.0.1:27017/placeconnect';
  const isRemote = targetUri.includes('mongodb+srv') || process.env.NODE_ENV === 'production' || process.env.VERCEL;
  const timeoutMS = isRemote ? 15000 : 2500;

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: timeoutMS,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (process.env.VERCEL) {
      console.error('[Database] On Vercel: Failed to connect to MongoDB Atlas:', error.message);
      throw error;
    }
    const autoMemory = process.env.USE_IN_MEMORY_DB === 'true' || process.env.USE_IN_MEMORY_DB === 'auto';
    if (autoMemory) {
      console.warn(`[Database] Could not connect to external MongoDB at ${targetUri}.`);
      console.log('[Database] Initializing embedded MongoDB Memory Server for zero-config demo/dev mode...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'placeconnect'
          }
        });
        const memoryUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`[Database] Connected to MongoDB Memory Server: ${memoryUri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] Failed to start MongoDB Memory Server:', memErr);
        throw memErr;
      }
    } else {
      console.error('[Database] MongoDB connection failed:', error.message);
      throw error;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};
