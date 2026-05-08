const express = require('express');
const { body } = require('express-validator');
const {
  getCandidateProfile,
  getEmployerProfile,
  updateCandidateProfile,
  updateEmployerProfile
} = require('../controllers/profileController');
const { authorize, protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/candidate', protect, authorize('candidate'), getCandidateProfile);
router.put(
  '/candidate',
  protect,
  authorize('candidate'),
  [
    body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage('Phone is too long'),
    body('location').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Location is too long'),
    body('headline').optional({ checkFalsy: true }).trim().isLength({ max: 160 }).withMessage('Headline is too long'),
    body('resumeUrl').optional({ checkFalsy: true }).isURL().withMessage('Resume URL must be valid'),
    body('experience').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Experience is too long')
  ],
  validateRequest,
  updateCandidateProfile
);

router.get('/employer', protect, authorize('employer'), getEmployerProfile);
router.put(
  '/employer',
  protect,
  authorize('employer'),
  [
    body('companyName').trim().isLength({ min: 2, max: 120 }).withMessage('Company name must be 2-120 characters'),
    body('website').optional({ checkFalsy: true }).isURL().withMessage('Website must be valid'),
    body('industry').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Industry is too long'),
    body('location').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Location is too long'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Description is too long')
  ],
  validateRequest,
  updateEmployerProfile
);

module.exports = router;
