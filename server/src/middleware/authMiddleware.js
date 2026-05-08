const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  if (!jwtSecret) {
    res.status(500);
    throw new Error('JWT_SECRET is missing. Create a local .env file from .env.example.');
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Not authorized');
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Forbidden for this role');
  }

  next();
};

module.exports = { protect, authorize };
