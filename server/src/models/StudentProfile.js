import mongoose from 'mongoose';

const projectSubSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    technologies: [{ type: String, trim: true }],
    githubUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
  },
  { _id: true }
);

const certificationSubSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    issueDate: { type: Date },
    credentialUrl: { type: String, trim: true },
  },
  { _id: true }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    PRN: {
      type: String,
      required: [true, 'PRN is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: [
        'Computer Engineering',
        'Information Technology',
        'Electronics & Telecommunication',
        'Mechanical Engineering',
        'Civil Engineering',
        'Electrical Engineering',
        'AIDS',
        'Chemical Engineering',
        'Other',
      ],
      index: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [2020, 'Year must be 2020 or later'],
      max: [2035, 'Year must be realistic'],
      index: true,
    },
    CGPA: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      index: true,
    },
    backlogs: {
      type: Number,
      required: [true, 'Backlogs count is required'],
      min: [0, 'Backlogs cannot be negative'],
      default: 0,
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    projects: [projectSubSchema],
    certifications: [certificationSubSchema],
    resume: {
      fileName: { type: String },
      originalName: { type: String },
      filePath: { type: String },
      fileSize: { type: Number },
      mimeType: { type: String },
      uploadedAt: { type: Date },
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
