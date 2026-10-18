import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication & Authorization Suite', () => {
  const testStudent = {
    name: 'Test Student',
    email: 'test.student@example.com',
    password: 'Password@123',
    PRN: 'PRN9999001',
    phone: '9876543210',
    branch: 'Computer Engineering',
    graduationYear: 2026,
    CGPA: 8.9,
    backlogs: 0,
    skills: ['React', 'Node.js', 'MongoDB'],
  };

  it('should register a new student successfully with 201 status and JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register/student')
      .send(testStudent);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('student');
    expect(res.body.token).toBeDefined();
  });

  it('should reject registration with duplicate email with 409 status', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register/student')
      .send(testStudent);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should log in an existing student and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testStudent.email,
        password: testStudent.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testStudent.email,
        password: 'WrongPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should register a new recruiter successfully with 201 status', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register/recruiter')
      .send({
        name: 'Talent Recruiter',
        email: 'recruiter@techcorp.com',
        password: 'Password@123',
        companyName: 'TechCorp Solutions',
        industry: 'Information Technology',
        location: 'Pune, Maharashtra',
        description: 'Enterprise IT solutions provider',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('recruiter');
  });
});
