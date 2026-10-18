import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const name = process.env.ADMIN_NAME || 'Placement Director';
    const email = process.env.ADMIN_EMAIL || 'admin@placeconnect.edu';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

    console.log(`[Admin Setup] Initializing placement administrator: ${email}`);

    let admin = await User.findOne({ email });

    if (admin) {
      console.log(`[Admin Setup] Admin account already exists. Updating credentials...`);
      admin.name = name;
      admin.passwordHash = await User.hashPassword(password);
      admin.role = 'admin';
      admin.accountStatus = 'active';
      await admin.save();
      console.log(`[Admin Setup] Admin user updated successfully.`);
    } else {
      const passwordHash = await User.hashPassword(password);
      admin = await User.create({
        name,
        email,
        passwordHash,
        role: 'admin',
        accountStatus: 'active',
      });
      console.log(`[Admin Setup] Admin user created successfully with ID: ${admin._id}`);
    }

    console.log('----------------------------------------------------');
    console.log(' Admin Login Credentials:');
    console.log(` Email:    ${email}`);
    console.log(` Password: ${password}`);
    console.log(' Role:     admin');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Admin Setup] Failed to create admin:', error.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

createAdmin();
