import express from 'express';
import {
  scheduleInterview,
  getMyInterviews,
  getRecruiterInterviews,
  updateInterview,
  deleteInterview,
} from '../controllers/interviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('recruiter', 'admin'), scheduleInterview);
router.get('/my', protect, authorize('student'), getMyInterviews);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterInterviews);
router.patch('/:id', protect, authorize('recruiter', 'admin'), updateInterview);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteInterview);

export default router;
