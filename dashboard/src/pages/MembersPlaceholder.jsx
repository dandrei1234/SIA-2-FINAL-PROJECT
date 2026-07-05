import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Select, MenuItem, InputLabel, FormControl, Alert, Chip } from "@mui/material";

function MembersPlaceholder() {
  const [members, setMembers] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://localhost:1337/api/members");
      setMembers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    success && setSuccess("");
    if (!studentId || !firstName || !lastName || !email) {
      setError("Please fill out all fields.");
      return;
    }
    try {
      await axios.post("http://localhost:1337/api/members", {
        studentId,
        firstName,
        lastName,
        email,
        role,
        status,
      });
      setSuccess(`Student ${firstName} ${lastName} registered successfully!`);
      // reset
      setStudentId("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("Student");
      setStatus("Active");
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register student.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete member record?")) return;
    try {
      await axios.delete(`http://localhost:1337/api/members/${id}`);
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "8px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1, overflowY: "auto", height: "100vh" }}>
      <div style={{ textAlign: "left", borderBottom: "1px solid var(--border-glow)", paddingBottom: "16px" }}>
        <h1 className="gradient-text" style={{ fontSize: "28px", margin: 0, fontWeight: "800", fontFamily: "var(--font-heading)" }}>
          Member Registration Module
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Assigned to: <strong>John Paul Dres</strong> | Active Database Schema Integration Interface
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: "600", borderBottom: "1px solid var(--border-glow)", paddingBottom: "8px" }}>
            👤 Add Student Profile
          </h3>

          {error && <Alert severity="error" style={{ fontSize: "12px" }}>{error}</Alert>}
          {success && <Alert severity="success" style={{ fontSize: "12px" }}>{success}</Alert>}

          <TextField
            label="Student ID (e.g. 2023-10011)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="School Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            size="small"
          />

          <FormControl size="small" fullWidth>
            <InputLabel id="role-select-label">Organizational Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Organizational Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Officer">Officer</MenuItem>
              <MenuItem value="Faculty">Faculty Member</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="status-select-label">Registration Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={status}
              label="Registration Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="Active">Active Student</MenuItem>
              <MenuItem value="Inactive">Inactive / Suspended</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            style={{
              background: "var(--accent-cyan)",
              color: "#ffffff",
              fontWeight: "700",
              textTransform: "none",
              borderRadius: "var(--border-radius-md)",
              marginTop: "8px"
            }}
          >
            Register Profile
          </Button>
        </form>

        {/* Member Table List */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: "600", borderBottom: "1px solid var(--border-glow)", paddingBottom: "8px", textAlign: "left" }}>
            📋 Registered Student Directory
          </h3>

          <TableContainer component={Paper} className="glass-panel" style={{ background: "transparent", border: "none", maxHeight: "400px", overflowY: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" style={{ padding: "20px", color: "var(--text-muted)" }}>
                      No members registered. Click Seed Database on the Attendance dashboard.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map(m => (
                    <TableRow key={m._id} hover>
                      <TableCell style={{ color: "var(--text-primary)", fontWeight: "600" }}>{m.studentId}</TableCell>
                      <TableCell style={{ color: "var(--text-primary)" }}>{m.lastName}, {m.firstName}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>{m.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={m.status}
                          color={m.status === "Active" ? "success" : "default"}
                          size="small"
                          style={{ fontSize: "10px", fontWeight: "600" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          onClick={() => handleDelete(m._id)}
                          style={{ color: "var(--accent-red)", textTransform: "none", fontSize: "12px" }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

      </div>
    </div>
  );
}

export default MembersPlaceholder;
