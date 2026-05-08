const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/env');

const signToken = (user) => {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing. Create a local .env file from .env.example.');
  }

  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
    expiresIn: '7d'
  });
};

const sendAuthResponse = (res, user, statusCode = 200) => {
  res.status(statusCode).json({
    token: signToken(user),
    user
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName } = req.body;

  if (!['candidate', 'employer'].includes(role)) {
    res.status(400);
    throw new Error('Public registration is only available for candidates and employers');
  }

  const userPayload = {
    name,
    email,
    password,
    role
  };

  if (role === 'candidate') {
    userPayload.candidateProfile = {};
  }

  if (role === 'employer') {
    userPayload.employerProfile = { companyName: companyName || name };
  }

  const user = await User.create(userPayload);
  sendAuthResponse(res, user, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been disabled');
  }

  sendAuthResponse(res, user);
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = {
  register,
  login,
  me
};
