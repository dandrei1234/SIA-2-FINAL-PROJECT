require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/school_org_db";
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const memberRouter = require("./routes/members");
const eventRouter = require("./routes/events");
const attendanceRouter = require("./routes/attendance");

app.use("/api/members", memberRouter);
app.use("/api/events", eventRouter);
app.use("/api/attendance", attendanceRouter);

app.get("/", (req, res) => {
    res.send("School Organization Management Ecosystem API is running.");
});

const port = process.env.PORT || 1337;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});