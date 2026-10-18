import { body } from 'express-validator';

export const registerStudentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('PRN')
    .trim()
    .notEmpty()
    .withMessage('Permanent Registration Number (PRN) is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+ -]{10,15}$/)
    .withMessage('Please provide a valid 10-15 digit phone number'),
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required'),
  body('graduationYear')
    .notEmpty()
    .withMessage('Graduation year is required')
    .isInt({ min: 2020, max: 2035 })
    .withMessage('Graduation year must be a valid integer between 2020 and 2035'),
  body('CGPA')
    .notEmpty()
    .withMessage('CGPA is required')
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be a decimal between 0.00 and 10.00'),
  body('backlogs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Backlogs must be a non-negative integer'),
];

export const registerRecruiterValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact representative name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Official email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry sector is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Company location / Headquarters is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Company overview description is required'),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Please enter a valid website URL'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
