import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['application', 'interview', 'job', 'company', 'announcement', 'general'],
      default: 'general',
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    relatedResource: {
      resourceType: { type: String },
      resourceId: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
