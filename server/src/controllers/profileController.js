const User = require('../models/User');
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

const getCandidateProfile = asyncHandler(async (req, res) => {
  res.json({ profile: req.user.candidateProfile || {} });
});

const updateCandidateProfile = asyncHandler(async (req, res) => {
  const { phone, location, headline, skills, resumeUrl, experience } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      candidateProfile: {
        phone,
        location,
        headline,
        skills: splitList(skills),
        resumeUrl,
        experience
      }
    },
    { new: true, runValidators: true }
  );

  res.json({ profile: user.candidateProfile, user });
});

const getEmployerProfile = asyncHandler(async (req, res) => {
  res.json({ profile: req.user.employerProfile || {} });
});

const updateEmployerProfile = asyncHandler(async (req, res) => {
  const { companyName, website, industry, location, description } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      employerProfile: {
        companyName,
        website,
        industry,
        location,
        description
      }
    },
    { new: true, runValidators: true }
  );

  res.json({ profile: user.employerProfile, user });
});

module.exports = {
  getCandidateProfile,
  updateCandidateProfile,
  getEmployerProfile,
  updateEmployerProfile
};
