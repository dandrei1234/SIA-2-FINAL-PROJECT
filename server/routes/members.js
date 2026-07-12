const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

// GET all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ lastName: 1, firstName: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET member by ID or Student ID
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let member = await Member.findOne({ studentId: identifier });
    if (!member && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      member = await Member.findById(identifier);
    }
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new member
router.post("/", async (req, res) => {
  const { studentId, firstName, lastName, email, course, role, status } = req.body;
  
  if (!studentId || !firstName || !lastName || !email) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const existingMember = await Member.findOne({ studentId });
    if (existingMember) {
      return res.status(400).json({ message: `Student ID ${studentId} is already registered` });
    }

    const member = new Member({
      studentId,
      firstName,
      lastName,
      email,
      course,
      role,
      status,
    });

    const newMember = await member.save();
    res.status(201).json(newMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update member
router.put("/:id", async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE member
router.delete("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    await member.deleteOne();
    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
