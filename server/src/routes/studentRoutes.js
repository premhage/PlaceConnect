import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  getResumeFile,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { resumeUpload } from '../config/multer.js';

const router = express.Router();

router.get('/me', protect, authorize('student'), getMyProfile);
router.patch('/me', protect, authorize('student'), updateMyProfile);
router.post(
  '/me/resume',
  protect,
  authorize('student'),
  resumeUpload.single('resume'),
  uploadResume
);
router.get('/:studentId/resume', protect, getResumeFile);

export default router;
