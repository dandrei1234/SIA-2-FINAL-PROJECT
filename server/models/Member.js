const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{8}$/, "Student ID must be an 8-digit number"],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ["Student", "Officer", "Faculty"],
    default: "Student",
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Member", memberSchema);
