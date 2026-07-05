const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Member = require("../models/Member");
const Event = require("../models/Event");

// POST /api/attendance/check-in
router.post("/check-in", async (req, res) => {
  const { studentId, eventId, checkInTime } = req.body;

  if (!studentId || !eventId) {
    return res.status(400).json({ message: "Student ID and Event ID are required" });
  }

  try {
    // 1. Find Member
    const member = await Member.findOne({ studentId });
    if (!member) {
      return res.status(404).json({ message: `Student with ID ${studentId} not found` });
    }

    if (member.status === "Inactive") {
      return res.status(400).json({ message: `Student ${member.firstName} is Inactive and cannot check in` });
    }

    // 2. Find Event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status === "Cancelled") {
      return res.status(400).json({ message: "This event has been cancelled" });
    }

    // 3. Check for existing attendance
    let attendance = await Attendance.findOne({ member: member._id, event: eventId });

    if (attendance) {
      if (attendance.checkIn) {
        return res.status(400).json({ 
          message: `${member.firstName} ${member.lastName} has already checked in at ${new Date(attendance.checkIn).toLocaleTimeString()}` 
        });
      }
    }

    // 4. Determine status based on event time
    // If checkIn is > 15 minutes after event.date, mark as Late, else Present.
    const actualCheckIn = checkInTime ? new Date(checkInTime) : new Date();
    const eventStart = new Date(event.date);
    const fifteenMinutes = 15 * 60 * 1000;
    
    let calculatedStatus = "Present";
    if (actualCheckIn.getTime() > (eventStart.getTime() + fifteenMinutes)) {
      calculatedStatus = "Late";
    }

    // 5. Save/Update record
    if (attendance) {
      attendance.checkIn = actualCheckIn;
      attendance.status = calculatedStatus;
    } else {
      attendance = new Attendance({
        member: member._id,
        event: eventId,
        checkIn: actualCheckIn,
        status: calculatedStatus,
      });
    }

    await attendance.save();
    
    // Populate member details
    const populated = await Attendance.findById(attendance._id).populate("member");
    
    res.status(200).json({
      message: `Checked in successfully: ${member.firstName} ${member.lastName} (${calculatedStatus})`,
      attendance: populated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/attendance/check-out
router.post("/check-out", async (req, res) => {
  const { studentId, eventId, checkOutTime } = req.body;

  if (!studentId || !eventId) {
    return res.status(400).json({ message: "Student ID and Event ID are required" });
  }

  try {
    // 1. Find Member
    const member = await Member.findOne({ studentId });
    if (!member) {
      return res.status(404).json({ message: `Student with ID ${studentId} not found` });
    }

    // 2. Find Attendance
    const attendance = await Attendance.findOne({ member: member._id, event: eventId });
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ 
        message: `No active check-in found for ${member.firstName} ${member.lastName} in this event. Check-in first.`
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ 
        message: `${member.firstName} has already checked out at ${new Date(attendance.checkOut).toLocaleTimeString()}`
      });
    }

    // 3. Save check-out time
    attendance.checkOut = checkOutTime ? new Date(checkOutTime) : new Date();
    await attendance.save();

    const populated = await Attendance.findById(attendance._id).populate("member");

    res.json({
      message: `Checked out successfully: ${member.firstName} ${member.lastName}`,
      attendance: populated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/attendance/event/:eventId
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

// GET /api/attendance/member/:memberId
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

// GET /api/attendance/stats/:eventId
router.get("/stats/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Total registered members
    const totalMembers = await Member.countDocuments({ status: "Active" });
    
    // Attendance records for this event
    const records = await Attendance.find({ event: eventId });
    
    let presentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    
    records.forEach(r => {
      if (r.status === "Present") presentCount++;
      else if (r.status === "Late") lateCount++;
      else if (r.status === "Excused") excusedCount++;
    });

    const checkInCount = presentCount + lateCount;
    const absentCount = Math.max(0, totalMembers - checkInCount - excusedCount);
    const attendanceRate = totalMembers > 0 ? Math.round((checkInCount / totalMembers) * 100) : 0;

    res.json({
      totalMembers,
      checkInCount,
      presentCount,
      lateCount,
      excusedCount,
      absentCount,
      attendanceRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/attendance/:id
router.put("/:id", async (req, res) => {
  try {
    const { checkIn, checkOut, status, remarks } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (checkIn !== undefined) attendance.checkIn = checkIn;
    if (checkOut !== undefined) attendance.checkOut = checkOut;
    if (status !== undefined) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    const populated = await Attendance.findById(attendance._id).populate("member");
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/attendance/:id
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

// POST /api/attendance/seed-data (Helper to quickly populate mock members and events for demonstration)
router.post("/seed-data", async (req, res) => {
  try {
    // 1. Clear existing Members, Events, Attendance
    await Member.deleteMany({});
    await Event.deleteMany({});
    await Attendance.deleteMany({});

    // 2. Add Mock Members
    const mockMembers = [
      { studentId: "2023-10001", firstName: "Luis Andrei", lastName: "Raymundo", email: "luis.raymundo@school.edu", role: "Officer", status: "Active" },
      { studentId: "2023-10002", firstName: "Cecilio Cesar", lastName: "Liwag", email: "cecilio.liwag@school.edu", role: "Officer", status: "Active" },
      { studentId: "2023-10003", firstName: "John Paul", lastName: "Dres", email: "john.dres@school.edu", role: "Student", status: "Active" },
      { studentId: "2023-10004", firstName: "Timothy Sancho", lastName: "Tabangin", email: "timothy.tabangin@school.edu", role: "Student", status: "Active" },
      { studentId: "2023-10005", firstName: "Ned Bryne", lastName: "Pinkihan", email: "ned.pinkihan@school.edu", role: "Student", status: "Active" },
      { studentId: "2023-10006", firstName: "Maria Clara", lastName: "Dela Cruz", email: "maria.delacruz@school.edu", role: "Student", status: "Active" },
      { studentId: "2023-10007", firstName: "Juan", lastName: "Luna", email: "juan.luna@school.edu", role: "Student", status: "Active" },
      { studentId: "2023-10008", firstName: "Jose", lastName: "Rizal", email: "jose.rizal@school.edu", role: "Faculty", status: "Active" },
      { studentId: "2023-10009", firstName: "Andres", lastName: "Bonifacio", email: "andres.bonifacio@school.edu", role: "Student", status: "Inactive" },
      { studentId: "2023-10010", firstName: "Emilio", lastName: "Aguinaldo", email: "emilio.aguinaldo@school.edu", role: "Student", status: "Active" },
    ];

    const insertedMembers = await Member.insertMany(mockMembers);

    // 3. Add Mock Events
    const now = new Date();
    
    // Event 1: Ongoing General Assembly (started 30 mins ago)
    const event1Date = new Date(now.getTime() - 30 * 60 * 1000);
    // Event 2: Upcoming Coding Hackathon (starts in 2 hours)
    const event2Date = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    // Event 3: Completed Team Building (held yesterday)
    const event3Date = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const mockEvents = [
      { title: "General Assembly & Orientation", description: "First semester general assembly for all computer science students.", date: event1Date, venue: "School Auditorium", capacity: 150, status: "Ongoing" },
      { title: "Smart City Hackathon 2026", description: "Design innovative software solutions for smart city challenges.", date: event2Date, venue: "IT Building Lab 4", capacity: 50, status: "Upcoming" },
      { title: "Student Leaders Leadership Seminar", description: "Team building and leadership seminar for school organization officers.", date: event3Date, venue: "Multi-Purpose Hall", capacity: 80, status: "Completed" }
    ];

    const insertedEvents = await Event.insertMany(mockEvents);

    // 4. Add Mock Attendance Logs (for completed and ongoing events)
    // For Event 3 (Completed): Let's check in some students
    // Luis checked in on time
    const att1 = new Attendance({
      member: insertedMembers[0]._id,
      event: insertedEvents[2]._id,
      checkIn: new Date(event3Date.getTime() + 5 * 60 * 1000), // 5 mins after start -> Present (under 15m grace)
      checkOut: new Date(event3Date.getTime() + 2 * 60 * 60 * 1000),
      status: "Present",
      remarks: "On time check-in and full attendance."
    });

    // John checked in late
    const att2 = new Attendance({
      member: insertedMembers[2]._id,
      event: insertedEvents[2]._id,
      checkIn: new Date(event3Date.getTime() + 25 * 60 * 1000), // 25 mins after start -> Late
      checkOut: new Date(event3Date.getTime() + 2 * 60 * 60 * 1000),
      status: "Late",
      remarks: "Traffic on the way."
    });

    // Ned was Excused
    const att3 = new Attendance({
      member: insertedMembers[4]._id,
      event: insertedEvents[2]._id,
      status: "Excused",
      remarks: "Represented the school in another competition."
    });

    await Attendance.insertMany([att1, att2, att3]);

    res.json({
      message: "Database seeded successfully!",
      membersCount: insertedMembers.length,
      eventsCount: insertedEvents.length,
      attendanceCount: 3
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
