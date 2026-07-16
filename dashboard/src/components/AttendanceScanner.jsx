import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { MenuItem, Select, FormControl, InputLabel, Button, TextField, FormControlLabel, Checkbox, CircularProgress } from "@mui/material";

function AttendanceScanner({ selectedEventId, onScanSuccess, refreshTrigger }) {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [manualStudentId, setManualStudentId] = useState("");
  const [scanAction, setScanAction] = useState("check-in");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [refreshTrigger, selectedEventId]);

  const fetchMembers = async () => {
    try {
      let url = `${API_URL}/members`;
      if (selectedEventId) {
        url = `${API_URL}/members/event/${selectedEventId}`;
      }
      const res = await axios.get(url);
      setMembers(res.data);
    } catch (error) {
      console.error("Error fetching members for scanner:", error);
    }
  };



  const handleMemberChange = (e) => {
    setSelectedMemberId(e.target.value);
    if (e.target.value) {
      const selected = members.find(m => m.studentId === e.target.value);
      setManualStudentId(selected ? selected.studentId : "");
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    const idToScan = manualStudentId || selectedMemberId;
    if (!idToScan) return;
    if (!selectedEventId) {
      setScanResult({
        success: false,
        message: "Please select an active event first from the dashboard panel.",
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setLoading(true);


    setTimeout(async () => {
      try {
        const endpoint = "check-in";
        const payload = {
          studentId: idToScan.trim(),
          eventId: selectedEventId,
        };

        const res = await axios.post(`${API_URL}/attendance/${endpoint}`, payload);
        
        setScanResult({
          success: true,
          message: res.data.message,
          data: res.data.attendance,
        });
        if (onScanSuccess) {
          onScanSuccess();
        }
      } catch (error) {
        console.error(error);
        setScanResult({
          success: false,
          message: error.response?.data?.message || "Internal server error. Code: 500",
        });
      } finally {
        setIsScanning(false);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: "600", borderBottom: "1px solid var(--border-glow)", paddingBottom: "12px", textAlign: "left" }}>
        Record Attendance
      </h3>

      <form onSubmit={handleScan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        <FormControl fullWidth style={{ marginTop: "8px" }}>
          <InputLabel id="student-select-label" style={{ color: "var(--text-secondary)" }}>Select Registered Student</InputLabel>
          <Select
            labelId="student-select-label"
            value={selectedMemberId}
            label="Select Registered Student"
            onChange={handleMemberChange}
            style={{
              borderRadius: "var(--border-radius-md)",
              color: "var(--text-primary)",
            }}
          >
            <MenuItem value=""><em>-- None (Enter ID manually below) --</em></MenuItem>
            {members.map(m => (
              <MenuItem key={m._id} value={m.studentId}>
                {m.lastName}, {m.firstName} ({m.studentId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>OR TYPE ID</span>
          <div style={{ height: "1px", background: "var(--border-glow)", width: "100%" }}></div>
        </div>


        <TextField
          label="Student ID (e.g. 40374230)"
          value={manualStudentId}
          onChange={(e) => setManualStudentId(e.target.value)}
          variant="outlined"
          fullWidth
          InputLabelProps={{ style: { color: "var(--text-secondary)" } }}
          inputProps={{ style: { color: "var(--text-primary)" } }}
          style={{
            borderRadius: "var(--border-radius-md)",
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading || (!manualStudentId && !selectedMemberId)}
          style={{
            background: "var(--accent-cyan)",
            color: "#ffffff",
            fontWeight: "700",
            padding: "12px",
            fontSize: "15px",
            textTransform: "none",
            borderRadius: "var(--border-radius-md)",
            boxShadow: "var(--box-shadow-sm)",
          }}
        >
          {loading ? <CircularProgress size={24} style={{ color: "#090b0f" }} /> : `Record Attendance`}
        </Button>
      </form>


      {scanResult && (
        <div
          className="glass-panel"
          style={{
            padding: "16px",
            background: scanResult.success ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
            borderColor: scanResult.success ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--border-radius-md)",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: scanResult.success ? "var(--accent-green)" : "var(--accent-red)"
            }}></span>
            <span style={{
              fontSize: "14px",
              fontWeight: "700",
              color: scanResult.success ? "var(--accent-green)" : "var(--accent-red)"
            }}>
              {scanResult.success ? "AUTHENTICATION SUCCESSFUL" : "ACCESS DENIED"}
            </span>
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>{scanResult.message}</p>

          {scanResult.success && scanResult.data && (
            <div style={{
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px"
            }}>
              <span>Student:</span>
              <strong style={{ color: "var(--text-primary)" }}>
                {scanResult.data.member?.firstName} {scanResult.data.member?.lastName}
              </strong>
              <span>Status:</span>
              <strong style={{
                color: scanResult.data.status === "Present" ? "var(--accent-green)" : "var(--accent-yellow)"
              }}>
                {scanResult.data.status}
              </strong>
              <span>Checked In:</span>
              <strong style={{ color: "var(--text-primary)" }}>
                {new Date(scanResult.data.checkIn).toLocaleTimeString()}
              </strong>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendanceScanner;
