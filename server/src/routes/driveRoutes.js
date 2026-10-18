import express from 'express';
import {
  getPlacementDrives,
  createPlacementDrive,
  deletePlacementDrive,
} from '../controllers/placementDriveController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPlacementDrives);
router.post('/', protect, authorize('admin'), createPlacementDrive);
router.delete('/:id', protect, authorize('admin'), deletePlacementDrive);

export default router;
