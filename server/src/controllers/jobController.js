import { Job } from '../models/Job.js';
import { Company } from '../models/Company.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { checkEligibility } from '../services/eligibilityEngine.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @desc    Get all public / student accessible jobs with filtering & pagination
 * @route   GET /api/v1/jobs
 * @access  Public / Authenticated
 */
export const getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {
      status: 'active',
      approvalStatus: 'approved',
    };

    // Text search
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { requiredSkills: searchRegex },
        { location: searchRegex },
      ];
    }

    // Branch filter
    if (req.query.branch && req.query.branch !== 'All') {
      query.$or = query.$or || [];
      query.eligibleBranches = { $in: [req.query.branch, 'All Branches'] };
    }

    // Job Type filter
    if (req.query.jobType && req.query.jobType !== 'All') {
      query.jobType = req.query.jobType;
    }

    // Location filter
    if (req.query.location) {
      query.location = new RegExp(req.query.location, 'i');
    }

    // Min Salary filter
    if (req.query.minSalary) {
      query['salaryRange.min'] = { $gte: Number(req.query.minSalary) };
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sortBy === 'deadline') {
      sort = { applicationDeadline: 1 };
    } else if (req.query.sortBy === 'salary') {
      sort = { 'salaryRange.max': -1 };
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('companyId', 'companyName industry location logoUrl website')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/v1/jobs/:id
 * @access  Public / Authenticated
 */
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'companyName industry description location website contactInformation logoUrl approvalStatus')
      .populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Evaluate student eligibility for a specific job
 * @route   GET /api/v1/jobs/:id/eligibility
 * @access  Private (Student)
 */
export const getJobEligibility = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    const eligibilityResult = await checkEligibility(studentProfile, job, true);

    res.status(200).json({
      success: true,
      data: eligibilityResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job posting
 * @route   POST /api/v1/jobs
 * @access  Private (Recruiter)
 */
export const createJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ ownerUserId: req.user._id });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company profile not found for this recruiter.',
      });
    }

    if (company.approvalStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your company profile is pending placement cell verification. You cannot post jobs until approved.',
      });
    }

    const {
      title,
      description,
      responsibilities = [],
      requiredSkills = [],
      eligibleBranches = [],
      minimumCGPA = 0,
      maximumBacklogs = 0,
      eligibleGraduationYears = [],
      location,
      jobType = 'Full-Time',
      salaryRange,
      applicationDeadline,
    } = req.body;

    const job = await Job.create({
      companyId: company._id,
      createdBy: req.user._id,
      title,
      description,
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities
        : responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      eligibleBranches: Array.isArray(eligibleBranches)
        ? eligibleBranches
        : eligibleBranches.split(',').map((s) => s.trim()).filter(Boolean),
      minimumCGPA: Number(minimumCGPA),
      maximumBacklogs: Number(maximumBacklogs),
      eligibleGraduationYears: Array.isArray(eligibleGraduationYears)
        ? eligibleGraduationYears.map(Number)
        : (eligibleGraduationYears ? [Number(eligibleGraduationYears)] : []),
      location,
      jobType,
      salaryRange,
      applicationDeadline: new Date(applicationDeadline),
      status: 'active',
      approvalStatus: 'pending', // Requires admin review
    });

    await createNotification({
      userId: req.user._id,
      title: 'Job Posting Submitted for Review',
      message: `Your job posting "${title}" was submitted and is pending Placement Cell review.`,
      type: 'job',
      relatedResource: {
        resourceType: 'Job',
        resourceId: job._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully. Pending placement officer approval.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job posting
 * @route   PATCH /api/v1/jobs/:id
 * @access  Private (Recruiter / Admin)
 */
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    // Only owner recruiter or admin can update
    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this job posting.',
      });
    }

    const allowedUpdates = [
      'title',
      'description',
      'responsibilities',
      'requiredSkills',
      'eligibleBranches',
      'minimumCGPA',
      'maximumBacklogs',
      'eligibleGraduationYears',
      'location',
      'jobType',
      'salaryRange',
      'applicationDeadline',
      'status',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/v1/jobs/:id
 * @access  Private (Recruiter / Admin)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job posting.',
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job posting removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle job publication status (active / closed)
 * @route   PATCH /api/v1/jobs/:id/publish
 * @access  Private (Recruiter / Admin)
 */
export const togglePublishJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this job posting.',
      });
    }

    job.status = job.status === 'active' ? 'closed' : 'active';
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job status changed to ${job.status}.`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};
