import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedInitialData } from '../src/utils/seedHelper.js';

dotenv.config();

const runSeed = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: Cannot run seed script in production environment!');
    process.exit(1);
  }

  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();
    await seedInitialData(true);
    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('====================================================');
    console.log('Demo Accounts Created:');
    console.log('----------------------------------------------------');
    console.log('1. Admin:     admin@placeconnect.edu      | Admin@123456');
    console.log('2. Recruiter: recruiter.msft@microsoft.com| Password@123');
    console.log('   Recruiter: campus@google.com           | Password@123');
    console.log('   Recruiter: talent@infosys.com          | Password@123');
    console.log('3. Student:   aarav.sharma@student.edu    | Password@123 (Placed @ Microsoft)');
    console.log('   Student:   diya.patel@student.edu      | Password@123 (Interview @ Google)');
    console.log('   Student:   kabir.verma@student.edu     | Password@123');
    console.log('   Student:   neha.deshmukh@student.edu   | Password@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seed Error]:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

runSeed();
