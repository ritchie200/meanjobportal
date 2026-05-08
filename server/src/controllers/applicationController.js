const Application = require('../models/Application');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');

const applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job || job.status !== 'open') {
    res.status(404);
    throw new Error('Open job not found');
  }

  const application = await Application.create({
    job: job._id,
    candidate: req.user._id,
    employer: job.employer,
    coverLetter: req.body.coverLetter,
    resumeUrl: req.body.resumeUrl || req.user.candidateProfile?.resumeUrl
  });

  res.status(201).json({ application });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate('job', 'title companyName location employmentType status')
    .sort({ createdAt: -1 });

  res.json({ applications });
});

const getEmployerApplications = asyncHandler(async (req, res) => {
  const query = { employer: req.user._id };

  if (req.query.jobId) {
    query.job = req.query.jobId;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const applications = await Application.find(query)
    .populate('candidate', 'name email candidateProfile')
    .populate('job', 'title companyName location status')
    .sort({ createdAt: -1 });

  res.json({ applications });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const ownsApplication = application.employer.toString() === req.user._id.toString();

  if (req.user.role !== 'admin' && !ownsApplication) {
    res.status(403);
    throw new Error('You can only update applications for your own jobs');
  }

  application.status = req.body.status;
  await application.save();

  const populated = await application.populate([
    { path: 'candidate', select: 'name email candidateProfile' },
    { path: 'job', select: 'title companyName location status' }
  ]);

  res.json({ application: populated });
});

module.exports = {
  applyToJob,
  getMyApplications,
  getEmployerApplications,
  updateApplicationStatus
};
