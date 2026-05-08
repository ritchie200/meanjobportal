const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time'
    },
    salaryMin: {
      type: Number,
      min: 0
    },
    salaryMax: {
      type: Number,
      min: 0
    },
    skills: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true
    }
  },
  { timestamps: true }
);

jobSchema.index({
  title: 'text',
  description: 'text',
  companyName: 'text',
  location: 'text',
  skills: 'text'
});

module.exports = mongoose.model('Job', jobSchema);
