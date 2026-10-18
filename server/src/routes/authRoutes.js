import express from 'express';
import {
  registerStudent,
  registerRecruiter,
  login,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerStudentValidator,
  registerRecruiterValidator,
  loginValidator,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register/student', validate(registerStudentValidator), registerStudent);
router.post('/register/recruiter', validate(registerRecruiterValidator), registerRecruiter);
router.post('/login', validate(loginValidator), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
