import express from 'express';
import {
  getAdminDashboard,
  getAllStudents,
  updateStudentStatus,
  getAllCompanies,
  updateCompanyApproval,
  getAllJobs,
  updateJobApproval,
  getPlacementReports,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protect & authorize('admin') to all admin endpoints
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/students', getAllStudents);
router.patch('/students/:userId/status', updateStudentStatus);
router.get('/companies', getAllCompanies);
router.patch('/companies/:id/approval', updateCompanyApproval);
router.get('/jobs', getAllJobs);
router.patch('/jobs/:id/approval', updateJobApproval);
router.get('/reports/placements', getPlacementReports);

export default router;
