import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    eligibleBranches: [
      {
        type: String,
        trim: true,
      },
    ],
    minimumCGPA: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 6.0,
      index: true,
    },
    maximumBacklogs: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    eligibleGraduationYears: [
      {
        type: Number,
      },
    ],
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-Time', 'Internship', 'Internship + PPO', 'Part-Time', 'Contract'],
      default: 'Full-Time',
      index: true,
    },
    salaryRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      period: { type: String, default: 'LPA' }, // LPA or /month
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'active',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Search text index for title, description, skills
jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

export const Job = mongoose.model('Job', jobSchema);
