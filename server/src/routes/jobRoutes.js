import express from 'express';
import {
  getJobs,
  getJobById,
  getJobEligibility,
  createJob,
  updateJob,
  deleteJob,
  togglePublishJob,
} from '../controllers/jobController.js';
import { getJobApplications } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createJobValidator, updateJobValidator } from '../validators/jobValidators.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.get('/:id/eligibility', protect, authorize('student'), getJobEligibility);
router.post('/', protect, authorize('recruiter'), validate(createJobValidator), createJob);
router.patch('/:id', protect, authorize('recruiter', 'admin'), validate(updateJobValidator), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.patch('/:id/publish', protect, authorize('recruiter', 'admin'), togglePublishJob);

// Nested route for applications of a specific job
router.get('/:jobId/applications', protect, authorize('recruiter', 'admin'), getJobApplications);

export default router;
