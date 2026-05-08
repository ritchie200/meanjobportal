const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    resumeUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'submitted',
      index: true
    }
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
