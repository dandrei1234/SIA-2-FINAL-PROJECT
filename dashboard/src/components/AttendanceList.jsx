import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, InputLabel,
  FormControl, TextField, Alert, Chip
} from "@mui/material";

function AttendanceList({ eventId, refreshTrigger, onRecordChange }) {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");


  useEffect(() => {
    if (eventId) {
      fetchRecords();
    }
  }, [eventId, refreshTrigger]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:1337/api/attendance/event/${eventId}`);
      setRecords(res.data);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (record) => {
    setSelectedRecord(record);
    setEditStatus(record.status);
    setEditRemarks(record.remarks || "");
    if (record.checkIn) {
      setEditCheckIn(new Date(record.checkIn).toISOString().slice(0, 16));
    } else {
      setEditCheckIn("");
    }
    if (record.checkOut) {
      setEditCheckOut(new Date(record.checkOut).toISOString().slice(0, 16));
    } else {
      setEditCheckOut("");
    }
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    try {
      const payload = {
        status: editStatus,
        remarks: editRemarks,
        checkIn: editCheckIn ? new Date(editCheckIn) : null,
        checkOut: editCheckOut ? new Date(editCheckOut) : null,
      };
      await axios.put(`http://localhost:1337/api/attendance/${selectedRecord._id}`, payload);
      setEditOpen(false);
      fetchRecords();
      if (onRecordChange) onRecordChange();
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record. Make sure times are valid.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
    try {
      await axios.delete(`http://localhost:1337/api/attendance/${id}`);
      fetchRecords();
      if (onRecordChange) onRecordChange();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };


  const filteredRecords = records.filter((r) => {
    const student = r.member;
    if (!student) return false;

    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const idMatches = student.studentId.toLowerCase().includes(search.toLowerCase());
    const nameMatches = fullName.includes(search.toLowerCase());
    const matchesSearch = idMatches || nameMatches;

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusChipColor = (status) => {
    switch (status) {
      case "Present": return "success";
      case "Late": return "warning";
      case "Excused": return "info";
      default: return "error";
    }
  };

  if (!eventId) {
    return (
      <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
        <p style={{ fontSize: "16px" }}>Please select an event from the panel above to view attendance logs.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>


      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: "600", textAlign: "left" }}>
          📝 Attendance Sheet & Registry
        </h3>
      </div>


      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <TextField
          label="Search Student Name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          style={{ flex: 1, minWidth: "200px" }}
          InputLabelProps={{ style: { color: "var(--text-secondary)" } }}
          inputProps={{ style: { color: "var(--text-primary)" } }}
        />
        <FormControl size="small" style={{ width: "160px" }}>
          <InputLabel id="status-filter-label" style={{ color: "var(--text-secondary)" }}>Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ color: "var(--text-primary)", borderRadius: "var(--border-radius-md)" }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="present">Present</MenuItem>
            <MenuItem value="late">Late</MenuItem>
            <MenuItem value="excused">Excused</MenuItem>
          </Select>
        </FormControl>
      </div>


      <TableContainer component={Paper} className="glass-panel" style={{ background: "transparent", border: "none", maxHeight: "400px", overflowY: "auto" }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Check-In</TableCell>
              <TableCell>Check-Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ padding: "40px" }}>
                  Retrieving registry logs...
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ padding: "40px", color: "var(--text-muted)" }}>
                  No attendance records matched criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((r) => (
                <TableRow key={r._id} hover style={{ transition: "var(--transition-smooth)" }}>
                  <TableCell style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                    {r.member?.studentId}
                  </TableCell>
                  <TableCell style={{ color: "var(--text-primary)" }}>
                    {r.member?.lastName}, {r.member?.firstName}
                  </TableCell>
                  <TableCell>
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}
                  </TableCell>
                  <TableCell>
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Not checked out</span>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      color={getStatusChipColor(r.status)}
                      size="small"
                      style={{ fontWeight: "600", fontSize: "11px" }}
                    />
                  </TableCell>
                  <TableCell style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.remarks || <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>--</span>}
                  </TableCell>
                  <TableCell align="center">
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <Button
                        size="small"
                        onClick={() => handleOpenEdit(r)}
                        style={{ color: "var(--accent-cyan)", textTransform: "none", fontSize: "12px", minWidth: "auto" }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleDelete(r._id)}
                        style={{ color: "var(--accent-red)", textTransform: "none", fontSize: "12px", minWidth: "auto" }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>



      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ fontFamily: "var(--font-heading)", fontWeight: "600" }}>
          Edit Attendance Record
        </DialogTitle>
        <DialogContent style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "8px" }}>
          {selectedRecord && (
            <>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                Student: <strong>{selectedRecord.member?.firstName} {selectedRecord.member?.lastName}</strong> ({selectedRecord.member?.studentId})
              </p>

              <FormControl fullWidth>
                <InputLabel id="edit-status-label">Status</InputLabel>
                <Select
                  labelId="edit-status-label"
                  value={editStatus}
                  label="Status"
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                  <MenuItem value="Excused">Excused</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                </Select>
              </FormControl>

              <div>
                <InputLabel shrink style={{ fontSize: '14px', marginBottom: '4px' }}>Check-In Time</InputLabel>
                <TextField
                  type="datetime-local"
                  value={editCheckIn || ""}
                  onChange={(e) => setEditCheckIn(e.target.value)}
                  fullWidth
                />
              </div>

              <div>
                <InputLabel shrink style={{ fontSize: '14px', marginBottom: '4px' }}>Check-Out Time</InputLabel>
                <TextField
                  type="datetime-local"
                  value={editCheckOut || ""}
                  onChange={(e) => setEditCheckOut(e.target.value)}
                  fullWidth
                />
              </div>

              <TextField
                label="Remarks"
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} style={{ color: "var(--text-secondary)" }}>Cancel</Button>
          <Button onClick={handleSaveEdit} style={{ color: "var(--accent-cyan)", fontWeight: "600" }}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AttendanceList;
