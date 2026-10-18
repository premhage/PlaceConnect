import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @desc    Get aggregate system dashboard analytics for Placement Admin
 * @route   GET /api/v1/admin/dashboard
 * @access  Private (Admin)
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const approvedCompanies = await Company.countDocuments({ approvalStatus: 'approved' });
    const pendingCompanies = await Company.countDocuments({ approvalStatus: 'pending' });
    const publishedJobs = await Job.countDocuments({ status: 'active', approvalStatus: 'approved' });
    const totalApplications = await Application.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const selectedStudents = await Application.countDocuments({ status: 'Selected' });

    // 1. Branch-wise placement statistics (from actual Selected applications)
    const branchPlacementsRaw = await Application.aggregate([
      { $match: { status: 'Selected' } },
      {
        $lookup: {
          from: 'studentprofiles',
          localField: 'studentId',
          foreignField: '_id',
          as: 'profile',
        },
      },
      { $unwind: '$profile' },
      {
        $group: {
          _id: '$profile.branch',
          selectedCount: { $sum: 1 },
        },
      },
      { $project: { branch: '$_id', count: '$selectedCount', _id: 0 } },
    ]);

    // Ensure all standard engineering branches show on chart even if zero
    const standardBranches = [
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication',
      'Mechanical Engineering',
      'Civil Engineering',
      'AIDS',
    ];

    const branchPlacements = standardBranches.map((branchName) => {
      const found = branchPlacementsRaw.find((b) => b.branch === branchName);
      return {
        branch: branchName,
        placements: found ? found.count : 0,
      };
    });

    // 2. Application outcome breakdown
    const applicationOutcomesRaw = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const outcomeOrder = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'];
    const applicationOutcomes = outcomeOrder.map((status) => {
      const found = applicationOutcomesRaw.find((item) => item._id === status);
      return {
        name: status,
        count: found ? found.count : 0,
      };
    });

    // 3. Recent activity & pending items
    const pendingCompanyList = await Company.find({ approvalStatus: 'pending' })
      .populate('ownerUserId', 'name email')
      .limit(5);

    const pendingJobList = await Job.find({ approvalStatus: 'pending' })
      .populate('companyId', 'companyName')
      .populate('createdBy', 'name email')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          approvedCompanies,
          pendingCompanies,
          publishedJobs,
          totalApplications,
          totalInterviews,
          selectedStudents,
        },
        charts: {
          branchPlacements,
          applicationOutcomes,
        },
        pendingApprovals: {
          companies: pendingCompanyList,
          jobs: pendingJobList,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students with search and pagination
 * @route   GET /api/v1/admin/students
 * @access  Private (Admin)
 */
export const getAllStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.branch && req.query.branch !== 'All') {
      query.branch = req.query.branch;
    }

    if (req.query.graduationYear) {
      query.graduationYear = Number(req.query.graduationYear);
    }

    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      query.$or = [{ PRN: searchRegex }, { phone: searchRegex }];
    }

    const total = await StudentProfile.countDocuments(query);
    const profiles = await StudentProfile.find(query)
      .populate('userId', 'name email accountStatus lastLoginAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Compute application count for each student
    const studentsWithCounts = await Promise.all(
      profiles.map(async (profile) => {
        const applicationsCount = await Application.countDocuments({ studentId: profile._id });
        const selectedCount = await Application.countDocuments({ studentId: profile._id, status: 'Selected' });
        return {
          ...profile.toObject(),
          applicationsCount,
          isPlaced: selectedCount > 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: studentsWithCounts,
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
 * @desc    Update student account status (active / inactive / suspended)
 * @route   PATCH /api/v1/admin/students/:userId/status
 * @access  Private (Admin)
 */
export const updateStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account status. Allowed: active, inactive, suspended.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { accountStatus: status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Student account status updated to "${status}".`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies for admin review
 * @route   GET /api/v1/admin/companies
 * @access  Private (Admin)
 */
export const getAllCompanies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.approvalStatus = req.query.status;
    }

    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      query.$or = [{ companyName: searchRegex }, { industry: searchRegex }, { location: searchRegex }];
    }

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .populate('ownerUserId', 'name email accountStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: companies,
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
 * @desc    Approve or reject company registration
 * @route   PATCH /api/v1/admin/companies/:id/approval
 * @access  Private (Admin)
 */
export const updateCompanyApproval = async (req, res, next) => {
  try {
    const { status, rejectionReason = '' } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved, rejected, or pending.',
      });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    company.approvalStatus = status;
    company.rejectionReason = rejectionReason;
    if (status === 'approved') {
      company.approvedAt = new Date();
      company.approvedBy = req.user._id;
    }

    await company.save();

    // Notify company recruiter
    await createNotification({
      userId: company.ownerUserId,
      title: `Company Profile ${status.toUpperCase()}`,
      message:
        status === 'approved'
          ? `Congratulations! Your company profile for "${company.companyName}" has been approved. You can now post campus job drives.`
          : `Your company profile registration was ${status}. Reason: ${rejectionReason || 'Contact Placement Office for clarifications.'}`,
      type: 'company',
      relatedResource: {
        resourceType: 'Company',
        resourceId: company._id,
      },
    });

    res.status(200).json({
      success: true,
      message: `Company registration status marked as "${status}".`,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs for admin oversight
 * @route   GET /api/v1/admin/jobs
 * @access  Private (Admin)
 */
export const getAllJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.approvalStatus && req.query.approvalStatus !== 'All') {
      query.approvalStatus = req.query.approvalStatus;
    }
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('companyId', 'companyName industry location logoUrl')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Attach application counts
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicantsCount = await Application.countDocuments({ jobId: job._id });
        return {
          ...job.toObject(),
          applicantsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: jobsWithStats,
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
 * @desc    Approve or reject job posting
 * @route   PATCH /api/v1/admin/jobs/:id/approval
 * @access  Private (Admin)
 */
export const updateJobApproval = async (req, res, next) => {
  try {
    const { status, rejectionReason = '' } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved, rejected, or pending.',
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    job.approvalStatus = status;
    job.rejectionReason = rejectionReason;
    if (status === 'approved') {
      job.approvedAt = new Date();
      job.approvedBy = req.user._id;
    }

    await job.save();

    // Notify recruiter
    await createNotification({
      userId: job.createdBy,
      title: `Job Posting ${status.toUpperCase()}`,
      message:
        status === 'approved'
          ? `Your job posting "${job.title}" has been approved and published to eligible students!`
          : `Your job posting "${job.title}" was ${status}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      type: 'job',
      relatedResource: {
        resourceType: 'Job',
        resourceId: job._id,
      },
    });

    res.status(200).json({
      success: true,
      message: `Job posting marked as "${status}".`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed Placement Analytics and Report table
 * @route   GET /api/v1/admin/reports/placements
 * @access  Private (Admin)
 */
export const getPlacementReports = async (req, res, next) => {
  try {
    const query = { status: 'Selected' };

    const placements = await Application.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'jobId',
        select: 'title location jobType salaryRange eligibleBranches',
        populate: { path: 'companyId', select: 'companyName industry location' },
      })
      .sort({ updatedAt: -1 });

    // Summary calculations
    let totalPackageLPA = 0;
    let minPackageLPA = Infinity;
    let maxPackageLPA = 0;
    let countWithPackage = 0;

    placements.forEach((item) => {
      if (item.jobId?.salaryRange?.max) {
        const pkg = item.jobId.salaryRange.max;
        totalPackageLPA += pkg;
        countWithPackage += 1;
        if (pkg > maxPackageLPA) maxPackageLPA = pkg;
        if (pkg < minPackageLPA) minPackageLPA = pkg;
      }
    });

    const reportMetrics = {
      totalPlaced: placements.length,
      averagePackageLPA: countWithPackage > 0 ? (totalPackageLPA / countWithPackage).toFixed(2) : 0,
      highestPackageLPA: maxPackageLPA > 0 ? maxPackageLPA : 0,
      lowestPackageLPA: minPackageLPA !== Infinity ? minPackageLPA : 0,
    };

    res.status(200).json({
      success: true,
      data: {
        metrics: reportMetrics,
        placements,
      },
    });
  } catch (error) {
    next(error);
  }
};
