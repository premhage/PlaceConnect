import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import { sendTokenResponse } from '../utils/token.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @desc    Register a new Student
 * @route   POST /api/v1/auth/register/student
 * @access  Public
 */
export const registerStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      PRN,
      phone,
      branch,
      graduationYear,
      CGPA,
      backlogs = 0,
      skills = [],
      bio = '',
      linkedinUrl = '',
      githubUrl = '',
    } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    // Check if PRN already exists
    const existingPRN = await StudentProfile.findOne({ PRN: PRN.trim().toUpperCase() });
    if (existingPRN) {
      return res.status(409).json({
        success: false,
        message: 'A student profile with this PRN is already registered.',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create User record - Force role to 'student'
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'student',
      accountStatus: 'active',
      lastLoginAt: new Date(),
    });

    // Create StudentProfile record
    const profile = await StudentProfile.create({
      userId: user._id,
      PRN: PRN.trim().toUpperCase(),
      phone,
      branch,
      graduationYear: Number(graduationYear),
      CGPA: Number(CGPA),
      backlogs: Number(backlogs),
      skills: Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean),
      bio,
      linkedinUrl,
      githubUrl,
    });

    // Welcome Notification
    await createNotification({
      userId: user._id,
      title: 'Welcome to PlaceConnect!',
      message: 'Your student account has been created. Explore published job drives, complete your profile, and upload your resume to apply.',
      type: 'general',
    });

    sendTokenResponse(user, 201, res, 'Student account registered successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new Recruiter & Company
 * @route   POST /api/v1/auth/register/recruiter
 * @access  Public
 */
export const registerRecruiter = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      industry,
      description,
      location,
      website = '',
      contactPerson,
      contactEmail,
      contactPhone,
    } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create User record - Force role to 'recruiter'
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'recruiter',
      accountStatus: 'active',
      lastLoginAt: new Date(),
    });

    // Create Company record - Starts as 'pending' approval by Placement Admin
    const company = await Company.create({
      ownerUserId: user._id,
      companyName,
      industry,
      description,
      location,
      website,
      contactInformation: {
        contactPerson: contactPerson || name,
        contactEmail: contactEmail || email,
        contactPhone: contactPhone || '',
      },
      approvalStatus: 'pending',
    });

    // Welcome Notification
    await createNotification({
      userId: user._id,
      title: 'Company Registration Submitted',
      message: `Your company profile for ${companyName} has been submitted for placement administrator review. Once approved, you can publish job openings and review candidates.`,
      type: 'company',
      relatedResource: {
        resourceType: 'Company',
        resourceId: company._id,
      },
    });

    sendTokenResponse(user, 201, res, 'Recruiter and company registered successfully. Pending admin review.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    // Check account status
    if (user.accountStatus === 'inactive' || user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or suspended. Please contact the administrator.',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};

/**
 * @desc    Get current authenticated user info
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let extraData = {};

    if (user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: user._id });
      extraData = { studentProfile };
    } else if (user.role === 'recruiter') {
      const company = await Company.findOne({ ownerUserId: user._id });
      extraData = { company };
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        ...extraData,
      },
    });
  } catch (error) {
    next(error);
  }
};
