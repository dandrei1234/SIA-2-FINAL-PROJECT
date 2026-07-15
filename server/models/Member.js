const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First Name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required'],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      default: '',
    },
    yearLevel: {
      type: Number,
      required: [true, 'Year Level is required'],
      min: [1, 'Year Level must be at least 1'],
      max: [6, 'Year Level cannot exceed 6'],
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      trim: true,
    },
    membershipFeeStatus: {
      type: String,
      enum: {
        values: ['Paid', 'Unpaid'],
        message: '{VALUE} is not a valid membership fee status',
      },
      default: 'Unpaid',
    },
    membershipStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Active', 'Inactive'],
        message: '{VALUE} is not a valid membership status',
      },
      default: 'Pending',
    },
    dateRegistered: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Member', memberSchema, 'members');
