import express from 'express';
import {
  getMyCompany,
  updateMyCompany,
  getRecruiterJobs,
  getRecruiterDashboard,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, authorize('recruiter'), getMyCompany);
router.patch('/me', protect, authorize('recruiter'), updateMyCompany);
router.get('/jobs', protect, authorize('recruiter'), getRecruiterJobs);
router.get('/dashboard', protect, authorize('recruiter'), getRecruiterDashboard);

export default router;
