import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { Notification } from '../models/Notification.js';
import { PlacementDrive } from '../models/PlacementDrive.js';

export const seedInitialData = async (forceClear = false) => {
  const [userCount, jobCount] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
  ]);
  if (userCount > 0 && jobCount > 0 && !forceClear) {
    return; // Already has data
  }

  console.log('[AutoSeed] Database is empty. Seeding initial demo data...');
  if (forceClear) {
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
      PlacementDrive.deleteMany({}),
    ]);
  }

  const defaultPassword = await User.hashPassword('Password@123');
  const adminPassword = await User.hashPassword(process.env.ADMIN_PASSWORD || 'Admin@123456');

  // Admin
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Prof. Rajesh Sharma (Placement Officer)',
    email: process.env.ADMIN_EMAIL || 'admin@placeconnect.edu',
    passwordHash: adminPassword,
    role: 'admin',
    accountStatus: 'active',
  });

  // Recruiters
  const rec1User = await User.create({
    name: 'Satya Nadella Representative',
    email: 'recruiter.msft@microsoft.com',
    passwordHash: defaultPassword,
    role: 'recruiter',
    accountStatus: 'active',
  });
  const company1 = await Company.create({
    ownerUserId: rec1User._id,
    companyName: 'Microsoft Corporation India',
    industry: 'Software & Cloud Computing',
    description: 'Leading global cloud, AI, and enterprise software company.',
    location: 'Hyderabad, Telangana & Bengaluru, Karnataka',
    website: 'https://careers.microsoft.com',
    logoUrl: 'https://images.unsplash.com/photo-1642132652806-8c7a68574d6c?w=128&auto=format&fit=crop&q=80',
    contactInformation: {
      contactPerson: 'Aditi Rao',
      contactEmail: 'aditi.rao@microsoft.com',
      contactPhone: '+91 98765 43210',
    },
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  const rec2User = await User.create({
    name: 'Google Campus Talent Partner',
    email: 'campus@google.com',
    passwordHash: defaultPassword,
    role: 'recruiter',
    accountStatus: 'active',
  });
  const company2 = await Company.create({
    ownerUserId: rec2User._id,
    companyName: 'Google India Private Ltd',
    industry: 'Internet, AI & Search',
    description: 'World-renowned technology company specializing in internet-related services and AI products.',
    location: 'Bengaluru, Karnataka',
    website: 'https://careers.google.com',
    contactInformation: {
      contactPerson: 'Vikram Seth',
      contactEmail: 'vikram.seth@google.com',
      contactPhone: '+91 98765 11223',
    },
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  const rec3User = await User.create({
    name: 'Infosys University Lead',
    email: 'talent@infosys.com',
    passwordHash: defaultPassword,
    role: 'recruiter',
    accountStatus: 'active',
  });
  const company3 = await Company.create({
    ownerUserId: rec3User._id,
    companyName: 'Infosys Limited',
    industry: 'IT Consulting & Services',
    description: 'Global leader in next-generation digital services and consulting.',
    location: 'Pune, Maharashtra',
    website: 'https://www.infosys.com/careers',
    contactInformation: {
      contactPerson: 'Pooja Kulkarni',
      contactEmail: 'pooja.k@infosys.com',
      contactPhone: '+91 91234 56789',
    },
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  const rec4User = await User.create({
    name: 'FinNext AI Talent',
    email: 'hiring@finnext.io',
    passwordHash: defaultPassword,
    role: 'recruiter',
    accountStatus: 'active',
  });
  await Company.create({
    ownerUserId: rec4User._id,
    companyName: 'FinNext AI Labs',
    industry: 'FinTech & Web3',
    description: 'High-growth fintech startup building algorithmic trading and AI wealth management platforms.',
    location: 'Mumbai, Maharashtra',
    website: 'https://finnext.example.com',
    approvalStatus: 'pending',
  });

  // Students
  const s1User = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.edu',
    passwordHash: defaultPassword,
    role: 'student',
    accountStatus: 'active',
  });
  const s1Profile = await StudentProfile.create({
    userId: s1User._id,
    PRN: 'PRN2022001',
    phone: '+91 98111 22233',
    branch: 'Computer Engineering',
    graduationYear: 2026,
    CGPA: 9.45,
    backlogs: 0,
    skills: ['React', 'Node.js', 'MongoDB', 'Python', 'AWS', 'Docker'],
    bio: 'Third-year CS undergrad passionate about full-stack distributed systems, system design, and open-source contributions.',
    projects: [
      {
        title: 'Distributed Key-Value Store',
        description: 'Raft consensus based distributed store with snapshotting and gRPC endpoints.',
        technologies: ['Go', 'Raft', 'gRPC'],
      },
    ],
    resume: {
      fileName: `${s1User._id}_demo_resume.pdf`,
      originalName: 'Aarav_Sharma_Resume.pdf',
      filePath: 'uploads/resumes/demo_resume.pdf',
      fileSize: 1048576,
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    },
  });

  const s2User = await User.create({
    name: 'Diya Patel',
    email: 'diya.patel@student.edu',
    passwordHash: defaultPassword,
    role: 'student',
    accountStatus: 'active',
  });
  const s2Profile = await StudentProfile.create({
    userId: s2User._id,
    PRN: 'PRN2022002',
    phone: '+91 98222 33344',
    branch: 'Information Technology',
    graduationYear: 2026,
    CGPA: 8.85,
    backlogs: 0,
    skills: ['JavaScript', 'React', 'Java', 'Spring Boot', 'SQL'],
    bio: 'Enthusiastic IT student specializing in enterprise Java and modern front-end web applications.',
    resume: {
      fileName: `${s2User._id}_demo_resume.pdf`,
      originalName: 'Diya_Patel_IT_Resume.pdf',
      filePath: 'uploads/resumes/demo_resume.pdf',
      fileSize: 850000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    },
  });

  const s3User = await User.create({
    name: 'Kabir Verma',
    email: 'kabir.verma@student.edu',
    passwordHash: defaultPassword,
    role: 'student',
    accountStatus: 'active',
  });
  const s3Profile = await StudentProfile.create({
    userId: s3User._id,
    PRN: 'PRN2022003',
    phone: '+91 98333 44455',
    branch: 'AIDS',
    graduationYear: 2026,
    CGPA: 8.2,
    backlogs: 0,
    skills: ['Python', 'PyTorch', 'Machine Learning', 'Data Analysis', 'SQL'],
    bio: 'AI & Data Science engineering student focused on NLP and predictive analytics pipelines.',
    resume: {
      fileName: `${s3User._id}_demo_resume.pdf`,
      originalName: 'Kabir_Verma_DataScience_Resume.pdf',
      filePath: 'uploads/resumes/demo_resume.pdf',
      fileSize: 920000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    },
  });

  const s4User = await User.create({
    name: 'Neha Deshmukh',
    email: 'neha.deshmukh@student.edu',
    passwordHash: defaultPassword,
    role: 'student',
    accountStatus: 'active',
  });
  const s4Profile = await StudentProfile.create({
    userId: s4User._id,
    PRN: 'PRN2022004',
    phone: '+91 98444 55566',
    branch: 'Electronics & Telecommunication',
    graduationYear: 2026,
    CGPA: 7.15,
    backlogs: 1,
    skills: ['C++', 'Embedded Systems', 'IoT', 'Python'],
    bio: 'Hardware-software co-design enthusiast with hands-on IoT micro-controller projects.',
    resume: {
      fileName: `${s4User._id}_demo_resume.pdf`,
      originalName: 'Neha_Deshmukh_ENTC_Resume.pdf',
      filePath: 'uploads/resumes/demo_resume.pdf',
      fileSize: 670000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    },
  });

  // Jobs
  const job1 = await Job.create({
    companyId: company1._id,
    createdBy: rec1User._id,
    title: 'Software Development Engineer - Campus (SDE 1)',
    description: 'Design and develop highly scalable distributed cloud infrastructure for Azure. Collaborate with global teams on next-generation cloud services.',
    responsibilities: [
      'Write clean, well-tested production code in C++, C#, Java, or TypeScript',
      'Contribute to microservices architecture deployed to Microsoft Azure',
    ],
    requiredSkills: ['C++', 'Java', 'Python', 'Data Structures', 'Cloud'],
    eligibleBranches: ['Computer Engineering', 'Information Technology', 'AIDS'],
    minimumCGPA: 8.0,
    maximumBacklogs: 0,
    eligibleGraduationYears: [2026],
    location: 'Hyderabad / Bengaluru',
    jobType: 'Full-Time',
    salaryRange: { min: 28, max: 44, currency: 'INR', period: 'LPA' },
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active',
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  const job2 = await Job.create({
    companyId: company2._id,
    createdBy: rec2User._id,
    title: 'Associate Software Engineer - Campus 2026',
    description: 'Develop products used by billions of users worldwide. Solve hard algorithmic challenges at planet-scale.',
    responsibilities: [
      'Build algorithms for search indexing, ads ranking, and core infrastructure',
    ],
    requiredSkills: ['Algorithms', 'Data Structures', 'Python', 'C++'],
    eligibleBranches: ['Computer Engineering', 'Information Technology', 'AIDS', 'Electronics & Telecommunication'],
    minimumCGPA: 8.5,
    maximumBacklogs: 0,
    eligibleGraduationYears: [2026],
    location: 'Bengaluru, Karnataka',
    jobType: 'Full-Time',
    salaryRange: { min: 32, max: 52, currency: 'INR', period: 'LPA' },
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: 'active',
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  const job3 = await Job.create({
    companyId: company3._id,
    createdBy: rec3User._id,
    title: 'Specialist Programmer (Power Programmer)',
    description: 'Elite programming role focusing on cutting-edge full-stack and cloud modernization projects.',
    responsibilities: [
      'Develop enterprise cloud applications using React, Node.js, and Spring Boot',
    ],
    requiredSkills: ['Java', 'React', 'Node.js', 'SQL'],
    eligibleBranches: ['Computer Engineering', 'Information Technology', 'Electronics & Telecommunication', 'AIDS'],
    minimumCGPA: 7.0,
    maximumBacklogs: 1,
    eligibleGraduationYears: [2026],
    location: 'Pune / Bengaluru / Hyderabad',
    jobType: 'Full-Time',
    salaryRange: { min: 9.5, max: 12.5, currency: 'INR', period: 'LPA' },
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    status: 'active',
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  const job4 = await Job.create({
    companyId: company3._id,
    createdBy: rec3User._id,
    title: 'Systems Engineer - Digital Specialist',
    description: 'Entry-level technology role for passionate engineering graduates across all disciplines.',
    responsibilities: [
      'Undergo world-class training at Infosys Mysore Global Education Centre',
    ],
    requiredSkills: ['Problem Solving', 'Python Basics'],
    eligibleBranches: ['All Branches'],
    minimumCGPA: 6.0,
    maximumBacklogs: 1,
    eligibleGraduationYears: [2026],
    location: 'Pan India (Multiple Locations)',
    jobType: 'Full-Time',
    salaryRange: { min: 4.5, max: 6.5, currency: 'INR', period: 'LPA' },
    applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    status: 'active',
    approvalStatus: 'approved',
    approvedAt: new Date(),
    approvedBy: admin._id,
  });

  const job5 = await Job.create({
    companyId: company1._id,
    createdBy: rec1User._id,
    title: 'Data & Applied Scientist Intern',
    description: 'Summer internship exploring machine learning models on Microsoft Bing and Copilot.',
    responsibilities: ['Fine-tune generative AI transformer models'],
    requiredSkills: ['Python', 'Machine Learning'],
    eligibleBranches: ['Computer Engineering', 'AIDS'],
    minimumCGPA: 8.0,
    maximumBacklogs: 0,
    eligibleGraduationYears: [2026],
    location: 'Hyderabad, Telangana',
    jobType: 'Internship',
    salaryRange: { min: 1, max: 1.5, currency: 'INR', period: 'LPA' },
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: 'active',
    approvalStatus: 'pending',
  });

  // Applications
  const app1 = await Application.create({
    studentId: s1Profile._id,
    userId: s1User._id,
    jobId: job1._id,
    coverLetter: 'Hands-on experience building distributed systems.',
    resumeSnapshot: s1Profile.resume,
    status: 'Selected',
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'Applied', changedBy: s1User._id, changedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { status: 'Shortlisted', changedBy: rec1User._id, changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { status: 'Interview Scheduled', changedBy: rec1User._id, changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { status: 'Selected', changedBy: rec1User._id, changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Offered 44 LPA CTC.' },
    ],
  });

  const app2 = await Application.create({
    studentId: s2Profile._id,
    userId: s2User._id,
    jobId: job2._id,
    coverLetter: 'Passionate about algorithms and scalable services.',
    resumeSnapshot: s2Profile.resume,
    status: 'Interview Scheduled',
    appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'Applied', changedBy: s2User._id, changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { status: 'Shortlisted', changedBy: rec2User._id, changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { status: 'Interview Scheduled', changedBy: rec2User._id, changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Round 1 Scheduled' },
    ],
  });

  await Application.create({
    studentId: s3Profile._id,
    userId: s3User._id,
    jobId: job3._id,
    coverLetter: 'Expertise in modern web architectures and databases.',
    resumeSnapshot: s3Profile.resume,
    status: 'Shortlisted',
    appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'Applied', changedBy: s3User._id, changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { status: 'Shortlisted', changedBy: rec3User._id, changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
  });

  await Application.create({
    studentId: s4Profile._id,
    userId: s4User._id,
    jobId: job4._id,
    coverLetter: 'Interested in digital technologies and software consulting.',
    resumeSnapshot: s4Profile.resume,
    status: 'Under Review',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'Applied', changedBy: s4User._id, changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { status: 'Under Review', changedBy: rec3User._id, changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    ],
  });

  // Interviews
  await Interview.create({
    applicationId: app2._id,
    jobId: job2._id,
    studentId: s2Profile._id,
    roundName: 'Round 1: Data Structures & Algorithms',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    mode: 'Online',
    locationOrMeetingLink: 'https://meet.google.com/xyz-pc-interview',
    instructions: 'Online interview via Google Meet. Please be prepared with coding setup.',
    result: 'Pending',
    createdBy: rec2User._id,
  });

  await Interview.create({
    applicationId: app1._id,
    jobId: job1._id,
    studentId: s1Profile._id,
    roundName: 'Final Technical & Culture Fit Round',
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    mode: 'Online',
    locationOrMeetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_xyz',
    result: 'Cleared',
    feedback: 'Deep grasp of distributed protocols and software design.',
    createdBy: rec1User._id,
  });

  // Placement Drives
  await PlacementDrive.create({
    title: 'Phase-1 Campus Placement Drive 2025-26',
    description: 'Annual flagship placement season for Third & Final Year Engineering students.',
    participatingCompanies: [company1._id, company2._id, company3._id],
    participatingJobs: [job1._id, job2._id, job3._id, job4._id],
    eligibilityCriteria: 'All regular third/final year students with minimum 6.0 CGPA and approved profiles.',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isPublished: true,
    createdBy: admin._id,
  });

  // Notifications
  await Notification.create([
    {
      userId: s1User._id,
      title: 'Offer Letter Released: Microsoft SDE 1',
      message: 'Congratulations Aarav! You have been selected for Microsoft SDE 1. Check your email for formal documentation.',
      type: 'application',
    },
    {
      userId: s2User._id,
      title: 'Interview Scheduled: Google Campus Drive',
      message: 'Your Google Technical Round 1 is scheduled. Check your schedule tab for meeting link.',
      type: 'interview',
    },
    {
      userId: rec1User._id,
      title: 'Placement Season Active',
      message: 'Your job posting for Microsoft SDE 1 is approved and receiving applications.',
      type: 'job',
    },
  ]);

  console.log('[AutoSeed] Finished seeding demo data successfully.');
};
