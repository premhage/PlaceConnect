import fs from 'fs';
import path from 'path';
import { StudentProfile } from '../models/StudentProfile.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @desc    Get current student's complete profile
 * @route   GET /api/v1/students/me
 * @access  Private (Student)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email role accountStatus lastLoginAt'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please create one.',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student profile details
 * @route   PATCH /api/v1/students/me
 * @access  Private (Student)
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      branch,
      graduationYear,
      CGPA,
      backlogs,
      skills,
      projects,
      certifications,
      bio,
      linkedinUrl,
      githubUrl,
    } = req.body;

    // If user's display name is being updated
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name: name.trim() });
    }

    const updateFields = {};
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (branch !== undefined) updateFields.branch = branch;
    if (graduationYear !== undefined) updateFields.graduationYear = Number(graduationYear);
    if (CGPA !== undefined) updateFields.CGPA = Number(CGPA);
    if (backlogs !== undefined) updateFields.backlogs = Number(backlogs);
    if (skills !== undefined) {
      updateFields.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (projects !== undefined) updateFields.projects = projects;
    if (certifications !== undefined) updateFields.certifications = certifications;
    if (bio !== undefined) updateFields.bio = bio.trim();
    if (linkedinUrl !== undefined) updateFields.linkedinUrl = linkedinUrl.trim();
    if (githubUrl !== undefined) updateFields.githubUrl = githubUrl.trim();

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('userId', 'name email role accountStatus');

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload student resume
 * @route   POST /api/v1/students/me/resume
 * @access  Private (Student)
 */
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please select a PDF or DOC document.',
      });
    }

    const resumeData = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { resume: resumeData } },
      { new: true }
    );

    await createNotification({
      userId: req.user._id,
      title: 'Resume Uploaded',
      message: `Your resume "${req.file.originalname}" has been successfully uploaded and is ready for job applications.`,
      type: 'general',
    });

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      data: {
        resume: profile.resume,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download or view a student resume with strict access control
 * @route   GET /api/v1/students/:studentId/resume
 * @access  Private (Student self, recruiter for applicants, or Admin)
 */
export const getResumeFile = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const profile = await StudentProfile.findById(studentId);

    if (!profile || !profile.resume || !profile.resume.filePath) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found for this student.',
      });
    }

    // Authorization check
    let isAuthorized = false;

    // 1. Student self
    if (profile.userId.toString() === req.user._id.toString()) {
      isAuthorized = true;
    }

    // 2. Admin
    if (req.user.role === 'admin') {
      isAuthorized = true;
    }

    // 3. Recruiter who has an application from this student for their company job
    if (req.user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ createdBy: req.user._id }).select('_id');
      const jobIds = recruiterJobs.map((j) => j._id);
      const application = await Application.findOne({
        studentId: profile._id,
        jobId: { $in: jobIds },
      });
      if (application) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this candidate resume.',
      });
    }

    if (!fs.existsSync(profile.resume.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file does not exist on disk.',
      });
    }

    res.download(profile.resume.filePath, profile.resume.originalName);
  } catch (error) {
    next(error);
  }
};
