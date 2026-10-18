import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { checkEligibility } from '../src/services/eligibilityEngine.js';

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

describe('Placement Eligibility Engine Suite', () => {
  const dummyJob = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Senior Systems Engineer',
    status: 'active',
    approvalStatus: 'approved',
    eligibleBranches: ['Computer Engineering', 'Information Technology'],
    eligibleGraduationYears: [2026],
    minimumCGPA: 8.0,
    maximumBacklogs: 0,
    requiredSkills: ['React', 'Node.js'],
    applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  };

  it('should mark student eligible when all criteria match', async () => {
    const qualifiedStudent = {
      _id: new mongoose.Types.ObjectId(),
      branch: 'Computer Engineering',
      graduationYear: 2026,
      CGPA: 8.5,
      backlogs: 0,
      skills: ['React', 'Node.js', 'Python'],
    };

    const result = await checkEligibility(qualifiedStudent, dummyJob, false);
    expect(result.isEligible).toBe(true);
    expect(result.reasons.length).toBe(0);
  });

  it('should reject student when CGPA is below job minimum threshold', async () => {
    const lowCgpaStudent = {
      _id: new mongoose.Types.ObjectId(),
      branch: 'Computer Engineering',
      graduationYear: 2026,
      CGPA: 7.4,
      backlogs: 0,
      skills: ['React', 'Node.js'],
    };

    const result = await checkEligibility(lowCgpaStudent, dummyJob, false);
    expect(result.isEligible).toBe(false);
    expect(result.criteriaChecks.cgpaValid).toBe(false);
    expect(result.reasons[0]).toContain('below the required minimum');
  });

  it('should reject student when branch is not in eligible branches', async () => {
    const mechStudent = {
      _id: new mongoose.Types.ObjectId(),
      branch: 'Mechanical Engineering',
      graduationYear: 2026,
      CGPA: 8.8,
      backlogs: 0,
      skills: ['React', 'Node.js'],
    };

    const result = await checkEligibility(mechStudent, dummyJob, false);
    expect(result.isEligible).toBe(false);
    expect(result.criteriaChecks.branchMatch).toBe(false);
  });

  it('should reject student when backlogs exceed maximum allowed backlogs', async () => {
    const studentWithBacklogs = {
      _id: new mongoose.Types.ObjectId(),
      branch: 'Computer Engineering',
      graduationYear: 2026,
      CGPA: 8.5,
      backlogs: 2,
      skills: ['React', 'Node.js'],
    };

    const result = await checkEligibility(studentWithBacklogs, dummyJob, false);
    expect(result.isEligible).toBe(false);
    expect(result.criteriaChecks.backlogsValid).toBe(false);
  });

  it('should reject when job application deadline is in the past', async () => {
    const expiredJob = {
      ...dummyJob,
      applicationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    };

    const student = {
      _id: new mongoose.Types.ObjectId(),
      branch: 'Computer Engineering',
      graduationYear: 2026,
      CGPA: 9.0,
      backlogs: 0,
      skills: ['React', 'Node.js'],
    };

    const result = await checkEligibility(student, expiredJob, false);
    expect(result.isEligible).toBe(false);
    expect(result.criteriaChecks.deadlineValid).toBe(false);
  });
});
