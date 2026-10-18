import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { checkEligibility } from '../services/eligibilityEngine.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @desc    Submit a new job application
 * @route   POST /api/v1/applications
 * @access  Private (Student)
 */
export const applyJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter = '' } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required to submit an application.',
      });
    }

    // 1. Fetch job
    const job = await Job.findById(jobId).populate('companyId');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    // 2. Fetch student profile
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({
        success: false,
        message: 'Student profile not found. Please complete your academic profile before applying.',
      });
    }

    // 3. Check resume existence
    if (!studentProfile.resume || !studentProfile.resume.filePath) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume to your profile before applying for jobs.',
      });
    }

    // 4. Server-side Eligibility Verification
    const eligibility = await checkEligibility(studentProfile, job, true);
    if (!eligibility.isEligible) {
      return res.status(400).json({
        success: false,
        message: 'You do not meet the eligibility requirements for this job posting.',
        reasons: eligibility.reasons,
        criteriaChecks: eligibility.criteriaChecks,
      });
    }

    // 5. Create Application document
    const application = await Application.create({
      studentId: studentProfile._id,
      userId: req.user._id,
      jobId: job._id,
      coverLetter,
      resumeSnapshot: {
        fileName: studentProfile.resume.fileName,
        originalName: studentProfile.resume.originalName,
        filePath: studentProfile.resume.filePath,
        fileSize: studentProfile.resume.fileSize,
        uploadedAt: studentProfile.resume.uploadedAt || new Date(),
      },
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          changedBy: req.user._id,
          changedAt: new Date(),
          note: 'Application submitted by candidate.',
        },
      ],
    });

    // 6. Notify Recruiter
    await createNotification({
      userId: job.createdBy,
      title: 'New Applicant Received',
      message: `${req.user.name} applied for "${job.title}".`,
      type: 'application',
      relatedResource: {
        resourceType: 'Application',
        resourceId: application._id,
      },
    });

    // 7. Notify Student
    await createNotification({
      userId: req.user._id,
      title: 'Application Submitted Successfully',
      message: `Your application for "${job.title}" at ${job.companyId?.companyName || 'the company'} has been submitted.`,
      type: 'application',
      relatedResource: {
        resourceType: 'Application',
        resourceId: application._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's own applications
 * @route   GET /api/v1/applications/my
 * @access  Private (Student)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const applications = await Application.find({ studentId: studentProfile._id })
      .populate({
        path: 'jobId',
        select: 'title location jobType salaryRange applicationDeadline status',
        populate: {
          path: 'companyId',
          select: 'companyName industry location logoUrl',
        },
      })
      .populate('statusHistory.changedBy', 'name role')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application details
 * @route   GET /api/v1/applications/:id
 * @access  Private (Student, Recruiter, Admin)
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'companyName industry location' },
      })
      .populate('statusHistory.changedBy', 'name role');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Authorization
    let isAllowed = false;
    if (req.user.role === 'admin') isAllowed = true;
    if (application.userId.toString() === req.user._id.toString()) isAllowed = true;
    if (application.jobId && application.jobId.createdBy && application.jobId.createdBy.toString() === req.user._id.toString()) {
      isAllowed = true;
    }

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this application.',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw student application
 * @route   PATCH /api/v1/applications/:id/withdraw
 * @access  Private (Student)
 */
export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications.',
      });
    }

    // Permitted only if status is 'Applied' or 'Under Review'
    if (!['Applied', 'Under Review'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application once status is "${application.status}".`,
      });
    }

    application.status = 'Withdrawn';
    application.withdrawnAt = new Date();
    application.statusHistory.push({
      status: 'Withdrawn',
      changedBy: req.user._id,
      changedAt: new Date(),
      note: req.body.note || 'Application withdrawn voluntarily by candidate.',
    });

    await application.save();

    // Notify recruiter
    if (application.jobId) {
      await createNotification({
        userId: application.jobId.createdBy,
        title: 'Application Withdrawn',
        message: `${req.user.name} withdrew their application for "${application.jobId.title}".`,
        type: 'application',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for a specific job (Recruiter / Admin)
 * @route   GET /api/v1/jobs/:jobId/applications
 * @access  Private (Recruiter of job / Admin)
 */
export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view applications for this job.',
      });
    }

    const query = { jobId };
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email lastLoginAt' },
      })
      .populate('statusHistory.changedBy', 'name role')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application recruitment status
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Private (Recruiter / Admin)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note = '' } = req.body;
    const allowedStatuses = [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Selected',
      'Rejected',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: [${allowedStatuses.join(', ')}].`,
      });
    }

    const application = await Application.findById(req.params.id)
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
        message: 'You are not authorized to modify recruitment status for this application.',
      });
    }

    const prevStatus = application.status;
    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note || `Status updated from ${prevStatus} to ${status}.`,
    });

    await application.save();

    // Notify Student
    await createNotification({
      userId: application.userId,
      title: `Application Status Updated: ${status}`,
      message: `Your application for "${application.jobId.title}" is now "${status}". ${note ? `Note: ${note}` : ''}`,
      type: 'application',
      relatedResource: {
        resourceType: 'Application',
        resourceId: application._id,
      },
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to "${status}".`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
