const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Member = require("../models/Member");
const Event = require("../models/Event");


router.post("/check-in", async (req, res) => {
  const { studentId, eventId, checkInTime } = req.body;

  if (!studentId || !eventId) {
    return res.status(400).json({ message: "Student ID and Event ID are required" });
  }

  try {

    const member = await Member.findOne({ studentId });
    if (!member) {
      return res.status(404).json({ message: `Student with ID ${studentId} not found` });
    }

    if (member.membershipStatus === "Inactive") {
      return res.status(400).json({ message: `Student ${member.firstName} is Inactive and cannot check in` });
    }


    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status === "cancelled") {
      return res.status(400).json({ message: "This event has been cancelled" });
    }


    let attendance = await Attendance.findOne({ member: member._id, event: eventId });

    if (attendance) {
      if (attendance.checkIn) {
        return res.status(400).json({ 
          message: `${member.firstName} ${member.lastName} has already checked in at ${new Date(attendance.checkIn).toLocaleTimeString()}` 
        });
      }
    }

    const actualCheckIn = checkInTime ? new Date(checkInTime) : new Date();
    let calculatedStatus = "Present";

    if (attendance) {
      attendance.checkIn = actualCheckIn;
      attendance.status = calculatedStatus;
    } else {
      attendance = new Attendance({
        member: member._id,
        memberName: `${member.firstName} ${member.lastName}`,
        studentId: member.studentId,
        event: eventId,
        checkIn: actualCheckIn,
        status: calculatedStatus,
      });
    }

    await attendance.save();



    const populated = await Attendance.findById(attendance._id).populate("member");
    
    res.status(200).json({
      message: `Checked in successfully: ${member.firstName} ${member.lastName} (${calculatedStatus})`,
      attendance: populated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




router.get("/event/:eventId", async (req, res) => {
  try {
    const records = await Attendance.find({ event: req.params.eventId })
      .populate("member")
      .sort({ checkIn: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/member/:memberId", async (req, res) => {
  try {
    const records = await Attendance.find({ member: req.params.memberId })
      .populate("event")
      .sort({ checkIn: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/stats/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    

    const totalMembers = await Member.countDocuments();
    

    const records = await Attendance.find({ event: eventId });
    const checkInCount = records.length;
    const presentCount = records.filter(r => r.status === "Present").length;
    const absentCount = records.filter(r => r.status === "Absent").length;

    const attendanceRate = totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;

    res.json({
      totalMembers,
      checkInCount,
      presentCount,
      absentCount,
      attendanceRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { member, event, checkIn, status, remarks } = req.body;
    let attendance = await Attendance.findOne({ member, event });
    
    if (attendance) {
      if (checkIn !== undefined) attendance.checkIn = checkIn;
      if (status !== undefined) attendance.status = status;
      if (remarks !== undefined) attendance.remarks = remarks;
      
      const memObj = await Member.findById(member);
      attendance.memberName = memObj ? `${memObj.firstName} ${memObj.lastName}` : "Unknown";
      attendance.studentId = memObj ? memObj.studentId : "Unknown";

    } else {
      const memObj = await Member.findById(member);
      attendance = new Attendance({
        member,
        memberName: memObj ? `${memObj.firstName} ${memObj.lastName}` : "Unknown",
        studentId: memObj ? memObj.studentId : "Unknown",
        event,
        checkIn: checkIn || null,
        status: status || "-",
        remarks: remarks || ""
      });
    }
    
    await attendance.save();
    const populated = await Attendance.findById(attendance._id).populate("member");
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { checkIn, status, remarks } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (checkIn !== undefined) attendance.checkIn = checkIn;
    if (status !== undefined) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    const populated = await Attendance.findById(attendance._id).populate("member");
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    await attendance.deleteOne();
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
