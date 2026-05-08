const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createJob,
  deleteJob,
  getEmployerJobs,
  getJobById,
  listJobs,
  updateJob
} = require('../controllers/jobController');
const { authorize, protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const jobValidators = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('companyName').optional({ checkFalsy: true }).trim().isLength({ min: 2 }).withMessage('Company name is too short'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('employmentType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'])
    .withMessage('Invalid employment type'),
  body('salaryMin').optional({ checkFalsy: true }).isNumeric().withMessage('Minimum salary must be numeric'),
  body('salaryMax').optional({ checkFalsy: true }).isNumeric().withMessage('Maximum salary must be numeric'),
  body('status').optional().isIn(['open', 'closed']).withMessage('Invalid job status')
];

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  validateRequest,
  listJobs
);

router.get('/employer/mine', protect, authorize('employer'), getEmployerJobs);
router.get('/:id', param('id').isMongoId().withMessage('Invalid job id'), validateRequest, getJobById);

router.post('/', protect, authorize('employer'), jobValidators, validateRequest, createJob);
router.put(
  '/:id',
  protect,
  authorize('employer', 'admin'),
  [param('id').isMongoId().withMessage('Invalid job id'), ...jobValidators],
  validateRequest,
  updateJob
);
router.delete(
  '/:id',
  protect,
  authorize('employer', 'admin'),
  [param('id').isMongoId().withMessage('Invalid job id')],
  validateRequest,
  deleteJob
);

module.exports = router;
