import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    roundName: {
      type: String,
      required: [true, 'Interview round name is required'],
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview scheduled date and time is required'],
      index: true,
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      default: 'Online',
    },
    locationOrMeetingLink: {
      type: String,
      required: [true, 'Location or meeting link is required'],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    result: {
      type: String,
      enum: ['Pending', 'Cleared', 'Failed', 'Cancelled', 'Rescheduled'],
      default: 'Pending',
      index: true,
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.model('Interview', interviewSchema);
