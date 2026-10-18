import express from 'express';
import {
  applyJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('student'), applyJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/:id', protect, getApplicationById);
router.patch('/:id/withdraw', protect, authorize('student'), withdrawApplication);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

export default router;
