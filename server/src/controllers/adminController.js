const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const [users, jobs, applications, openJobs, submittedApplications] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Job.countDocuments({ status: 'open' }),
    Application.countDocuments({ status: 'submitted' })
  ]);

  res.json({
    counts: {
      users,
      jobs,
      applications,
      openJobs,
      submittedApplications
    }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = req.body.isActive;
  await user.save();

  res.json({ user });
});

const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find()
    .populate('employer', 'name email employerProfile')
    .sort({ createdAt: -1 });

  res.json({ jobs });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  await Promise.all([
    Job.deleteOne({ _id: job._id }),
    Application.deleteMany({ job: job._id })
  ]);

  res.json({ message: 'Job deleted' });
});

const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate('candidate', 'name email candidateProfile')
    .populate('employer', 'name email employerProfile')
    .populate('job', 'title companyName location status')
    .sort({ createdAt: -1 });

  res.json({ applications });
});

module.exports = {
  getDashboard,
  getUsers,
  updateUserStatus,
  getJobs,
  deleteJob,
  getApplications
};
