import { Interview } from '../models/Interview.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @desc    Schedule an interview round for an application
 * @route   POST /api/v1/interviews
 * @access  Private (Recruiter / Admin)
 */
export const scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      roundName,
      scheduledAt,
      mode = 'Online',
      locationOrMeetingLink,
      instructions = '',
    } = req.body;

    if (!applicationId || !roundName || !scheduledAt || !locationOrMeetingLink) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, round name, scheduled time, and meeting location/link are required.',
      });
    }

    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Authorization
    if (
      application.jobId.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to schedule interviews for this job.',
      });
    }

    // Create interview record
    const interview = await Interview.create({
      applicationId: application._id,
      jobId: application.jobId._id,
      studentId: application.studentId._id,
      roundName,
      scheduledAt: new Date(scheduledAt),
      mode,
      locationOrMeetingLink,
      instructions,
      createdBy: req.user._id,
    });

    // Update application status to 'Interview Scheduled' if not already
    if (application.status !== 'Interview Scheduled') {
      application.status = 'Interview Scheduled';
      application.statusHistory.push({
        status: 'Interview Scheduled',
        changedBy: req.user._id,
        changedAt: new Date(),
        note: `Interview scheduled: ${roundName} on ${new Date(scheduledAt).toLocaleString()}.`,
      });
      await application.save();
    }

    // Send Notification to Student
    await createNotification({
      userId: application.userId,
      title: `Interview Scheduled: ${roundName}`,
      message: `You have an interview scheduled for "${application.jobId.title}" on ${new Date(scheduledAt).toLocaleString()} (${mode}). Link/Location: ${locationOrMeetingLink}`,
      type: 'interview',
      relatedResource: {
        resourceType: 'Interview',
        resourceId: interview._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully.',
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in student's scheduled interviews
 * @route   GET /api/v1/interviews/my
 * @access  Private (Student)
 */
export const getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find()
      .populate({
        path: 'applicationId',
        match: { userId: req.user._id },
        select: 'status appliedAt',
      })
      .populate({
        path: 'jobId',
        select: 'title location jobType companyId',
        populate: { path: 'companyId', select: 'companyName location logoUrl' },
      })
      .sort({ scheduledAt: 1 });

    // Filter out items where applicationId did not match (populate match filter)
    const studentInterviews = interviews.filter((item) => item.applicationId !== null);

    res.status(200).json({
      success: true,
      data: studentInterviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruiter's scheduled interviews
 * @route   GET /api/v1/interviews/recruiter
 * @access  Private (Recruiter)
 */
export const getRecruiterInterviews = async (req, res, next) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).select('_id');
    const jobIds = jobs.map((j) => j._id);

    const interviews = await Interview.find({ jobId: { $in: jobIds } })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('jobId', 'title location')
      .populate('applicationId', 'status appliedAt')
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update interview details or outcome result
 * @route   PATCH /api/v1/interviews/:id
 * @access  Private (Recruiter / Admin)
 */
export const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('jobId')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found.',
      });
    }

    if (
      interview.jobId.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this interview.',
      });
    }

    const { roundName, scheduledAt, mode, locationOrMeetingLink, instructions, result, feedback } = req.body;

    if (roundName) interview.roundName = roundName;
    if (scheduledAt) interview.scheduledAt = new Date(scheduledAt);
    if (mode) interview.mode = mode;
    if (locationOrMeetingLink) interview.locationOrMeetingLink = locationOrMeetingLink;
    if (instructions !== undefined) interview.instructions = instructions;
    if (result) interview.result = result;
    if (feedback !== undefined) interview.feedback = feedback;

    await interview.save();

    // If result changed, notify student
    if (result && result !== 'Pending') {
      const studentUserId = interview.studentId?.userId?._id || interview.studentId?.userId;
      if (studentUserId) {
        await createNotification({
          userId: studentUserId,
          title: `Interview Result: ${interview.roundName}`,
          message: `Your interview result for "${interview.jobId.title}" (${interview.roundName}) has been updated: ${result}. ${feedback ? `Feedback: ${feedback}` : ''}`,
          type: 'interview',
          relatedResource: {
            resourceType: 'Interview',
            resourceId: interview._id,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully.',
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Cancel an interview
 * @route   DELETE /api/v1/interviews/:id
 * @access  Private (Recruiter / Admin)
 */
export const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('jobId');
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found.',
      });
    }

    if (
      interview.jobId.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this interview.',
      });
    }

    await Interview.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Interview removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
