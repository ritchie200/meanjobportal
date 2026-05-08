const express = require('express');
const { body, param } = require('express-validator');
const {
  applyToJob,
  getEmployerApplications,
  getMyApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { authorize, protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/jobs/:jobId',
  protect,
  authorize('candidate'),
  [
    param('jobId').isMongoId().withMessage('Invalid job id'),
    body('coverLetter').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Cover letter is too long'),
    body('resumeUrl').optional({ checkFalsy: true }).isURL().withMessage('Resume URL must be valid')
  ],
  validateRequest,
  applyToJob
);

router.get('/me', protect, authorize('candidate'), getMyApplications);
router.get('/employer', protect, authorize('employer'), getEmployerApplications);
router.patch(
  '/:id/status',
  protect,
  authorize('employer', 'admin'),
  [
    param('id').isMongoId().withMessage('Invalid application id'),
    body('status')
      .isIn(['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'])
      .withMessage('Invalid application status')
  ],
  validateRequest,
  updateApplicationStatus
);

module.exports = router;
