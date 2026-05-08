const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    headline: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    resumeUrl: { type: String, trim: true },
    experience: { type: String, trim: true }
  },
  { _id: false }
);

const employerProfileSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    description: { type: String, trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ['candidate', 'employer', 'admin'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    candidateProfile: {
      type: candidateProfileSchema,
      default: undefined
    },
    employerProfile: {
      type: employerProfileSchema,
      default: undefined
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
