const Job = require('../models/Job');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');

const splitList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const buildJobPayload = (body, fallbackCompanyName) => ({
  title: body.title,
  description: body.description,
  companyName: body.companyName || fallbackCompanyName,
  location: body.location,
  employmentType: body.employmentType,
  salaryMin: body.salaryMin,
  salaryMax: body.salaryMax,
  skills: splitList(body.skills),
  status: body.status
});

const ensureJobAccess = (job, user) => {
  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  const ownsJob = job.employer.toString() === user._id.toString();

  if (user.role !== 'admin' && !ownsJob) {
    const error = new Error('You can only manage your own jobs');
    error.statusCode = 403;
    throw error;
  }
};

const listJobs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;
  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  } else {
    query.status = 'open';
  }

  if (req.query.employmentType) {
    query.employmentType = req.query.employmentType;
  }

  if (req.query.location) {
    query.location = { $regex: req.query.location, $options: 'i' };
  }

  if (req.query.search) {
    const search = { $regex: req.query.search, $options: 'i' };
    query.$or = [
      { title: search },
      { description: search },
      { companyName: search },
      { location: search },
      { skills: search }
    ];
  }

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('employer', 'name email employerProfile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(query)
  ]);

  res.json({
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  });
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('employer', 'name email employerProfile');

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  res.json({ job });
});

const getEmployerJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
  res.json({ jobs });
});

const createJob = asyncHandler(async (req, res) => {
  const fallbackCompanyName = req.user.employerProfile?.companyName || req.user.name;
  const job = await Job.create({
    ...buildJobPayload(req.body, fallbackCompanyName),
    employer: req.user._id
  });

  res.status(201).json({ job });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  ensureJobAccess(job, req.user);

  Object.assign(job, buildJobPayload(req.body, job.companyName));
  await job.save();

  res.json({ job });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  ensureJobAccess(job, req.user);

  await Promise.all([
    Job.deleteOne({ _id: job._id }),
    Application.deleteMany({ job: job._id })
  ]);

  res.json({ message: 'Job deleted' });
});

module.exports = {
  listJobs,
  getJobById,
  getEmployerJobs,
  createJob,
  updateJob,
  deleteJob
};
