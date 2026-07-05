const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  checkIn: {
    type: Date,
    default: Date.now,
  },
  checkOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Present", "Late", "Absent", "Excused"],
    default: "Present",
  },
  remarks: {
    type: String,
    trim: true,
  },
});

// A member can have only one attendance record per event
attendanceSchema.index({ member: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
