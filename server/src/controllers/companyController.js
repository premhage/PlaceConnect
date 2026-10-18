import { Company } from '../models/Company.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';

/**
 * @desc    Get current recruiter's company profile
 * @route   GET /api/v1/companies/me
 * @access  Private (Recruiter)
 */
export const getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ ownerUserId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found for this user.',
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current recruiter's company profile
 * @route   PATCH /api/v1/companies/me
 * @access  Private (Recruiter)
 */
export const updateMyCompany = async (req, res, next) => {
  try {
    const {
      companyName,
      industry,
      description,
      location,
      website,
      logoUrl,
      contactPerson,
      contactEmail,
      contactPhone,
    } = req.body;

    const company = await Company.findOne({ ownerUserId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found.',
      });
    }

    if (companyName) company.companyName = companyName.trim();
    if (industry) company.industry = industry.trim();
    if (description) company.description = description.trim();
    if (location) company.location = location.trim();
    if (website !== undefined) company.website = website.trim();
    if (logoUrl !== undefined) company.logoUrl = logoUrl.trim();

    company.contactInformation = {
      contactPerson: contactPerson || company.contactInformation?.contactPerson || '',
      contactEmail: contactEmail || company.contactInformation?.contactEmail || '',
      contactPhone: contactPhone || company.contactInformation?.contactPhone || '',
    };

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully.',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruiter's own posted jobs with application counts
 * @route   GET /api/v1/recruiter/jobs
 * @access  Private (Recruiter)
 */
export const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    // Compute applicant counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const totalApplicants = await Application.countDocuments({ jobId: job._id });
        const shortlistedCount = await Application.countDocuments({ jobId: job._id, status: 'Shortlisted' });
        const selectedCount = await Application.countDocuments({ jobId: job._id, status: 'Selected' });
        return {
          ...job.toObject(),
          totalApplicants,
          shortlistedCount,
          selectedCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruiter dashboard analytics and figures
 * @route   GET /api/v1/recruiter/dashboard
 * @access  Private (Recruiter)
 */
export const getRecruiterDashboard = async (req, res, next) => {
  try {
    const company = await Company.findOne({ ownerUserId: req.user._id });
    const jobs = await Job.find({ createdBy: req.user._id });
    const jobIds = jobs.map((j) => j._id);

    const activeJobsCount = jobs.filter((j) => j.status === 'active' && j.approvalStatus === 'approved').length;
    const pendingJobsCount = jobs.filter((j) => j.approvalStatus === 'pending').length;

    // Applicants across all recruiter jobs
    const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });
    const shortlistedCount = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'Shortlisted',
    });
    const selectedCount = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'Selected',
    });
    const underReviewCount = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'Under Review',
    });

    // Upcoming interviews
    const upcomingInterviews = await Interview.find({
      jobId: { $in: jobIds },
      scheduledAt: { $gte: new Date() },
    })
      .populate('studentId')
      .populate('jobId', 'title')
      .sort({ scheduledAt: 1 })
      .limit(5);

    // Job-wise applicant metrics
    const jobMetrics = await Promise.all(
      jobs.slice(0, 6).map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return {
          jobId: job._id,
          title: job.title,
          status: job.status,
          approvalStatus: job.approvalStatus,
          applicantCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        company,
        metrics: {
          totalJobs: jobs.length,
          activeJobs: activeJobsCount,
          pendingJobs: pendingJobsCount,
          totalApplicants,
          shortlistedCandidates: shortlistedCount,
          selectedCandidates: selectedCount,
          underReviewCandidates: underReviewCount,
        },
        jobMetrics,
        upcomingInterviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
