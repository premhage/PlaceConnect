import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 120,
      index: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry type is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Company location / HQ is required'],
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    contactInformation: {
      contactPerson: { type: String, trim: true },
      contactEmail: { type: String, trim: true },
      contactPhone: { type: String, trim: true },
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

export const Company = mongoose.model('Company', companySchema);
