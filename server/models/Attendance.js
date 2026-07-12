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
    enum: ["Present", "Absent"],
    default: "Present",
  },
  remarks: {
    type: String,
    trim: true,
  },
});

attendanceSchema.index({ member: 1, event: 1 }, { unique: true });
module.exports = mongoose.model("Attendance", attendanceSchema);
