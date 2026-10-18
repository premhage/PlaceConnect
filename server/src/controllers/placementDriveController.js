import { PlacementDrive } from '../models/PlacementDrive.js';
import { User } from '../models/User.js';
import { notifyUsers } from '../services/notificationService.js';

/**
 * @desc    Get published placement drives and announcements
 * @route   GET /api/v1/drives
 * @access  Public / Authenticated
 */
export const getPlacementDrives = async (req, res, next) => {
  try {
    const drives = await PlacementDrive.find({ isPublished: true })
      .populate('participatingCompanies', 'companyName industry location logoUrl')
      .populate('participatingJobs', 'title location salaryRange jobType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new placement drive / announcement
 * @route   POST /api/v1/drives
 * @access  Private (Admin)
 */
export const createPlacementDrive = async (req, res, next) => {
  try {
    const {
      title,
      description,
      participatingCompanies = [],
      participatingJobs = [],
      eligibilityCriteria,
      startDate,
      endDate,
    } = req.body;

    const drive = await PlacementDrive.create({
      title,
      description,
      participatingCompanies,
      participatingJobs,
      eligibilityCriteria,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.user._id,
      isPublished: true,
    });

    // Broadcast in-app notification to all students
    const students = await User.find({ role: 'student', accountStatus: 'active' }).select('_id');
    const studentIds = students.map((s) => s._id);

    await notifyUsers(studentIds, {
      title: `Placement Drive Announcement: ${title}`,
      message: `A new placement drive has been announced from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}. Check criteria and apply!`,
      type: 'announcement',
      relatedResource: {
        resourceType: 'PlacementDrive',
        resourceId: drive._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Placement drive announcement created and broadcast to students.',
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete placement drive
 * @route   DELETE /api/v1/drives/:id
 * @access  Private (Admin)
 */
export const deletePlacementDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Placement drive removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
