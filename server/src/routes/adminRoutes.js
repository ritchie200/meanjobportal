const express = require('express');
const { body, param } = require('express-validator');
const {
  deleteJob,
  getApplications,
  getDashboard,
  getJobs,
  getUsers,
  updateUserStatus
} = require('../controllers/adminController');
const { authorize, protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch(
  '/users/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('isActive').isBoolean().withMessage('isActive must be true or false')
  ],
  validateRequest,
  updateUserStatus
);

router.get('/jobs', getJobs);
router.delete('/jobs/:id', param('id').isMongoId().withMessage('Invalid job id'), validateRequest, deleteJob);
router.get('/applications', getApplications);

module.exports = router;
