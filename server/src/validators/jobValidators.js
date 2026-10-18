import { body } from 'express-validator';

export const createJobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Job title must be between 3 and 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('jobType')
    .optional()
    .isIn(['Full-Time', 'Internship', 'Internship + PPO', 'Part-Time', 'Contract'])
    .withMessage('Invalid job type selection'),
  body('minimumCGPA')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Minimum CGPA must be between 0 and 10'),
  body('maximumBacklogs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum backlogs must be 0 or higher'),
  body('salaryRange.min')
    .notEmpty()
    .withMessage('Minimum salary/stipend is required')
    .isNumeric()
    .withMessage('Minimum salary must be a number'),
  body('salaryRange.max')
    .notEmpty()
    .withMessage('Maximum salary/stipend is required')
    .isNumeric()
    .withMessage('Maximum salary must be a number'),
  body('applicationDeadline')
    .notEmpty()
    .withMessage('Application deadline is required')
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
];

export const updateJobValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Job title must be between 3 and 120 characters'),
  body('minimumCGPA')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Minimum CGPA must be between 0 and 10'),
  body('maximumBacklogs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum backlogs must be 0 or higher'),
];
