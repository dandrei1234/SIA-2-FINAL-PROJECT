import React, { useState, useEffect } from "react";
import axios from "axios";
import { MenuItem, Select, FormControl, InputLabel, Button, TextField, FormControlLabel, Checkbox, CircularProgress } from "@mui/material";

function AttendanceScanner({ selectedEventId, onScanSuccess, refreshTrigger }) {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [manualStudentId, setManualStudentId] = useState("");
  const [scanAction, setScanAction] = useState("check-in");
  const [simulateLate, setSimulateLate] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [refreshTrigger]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://localhost:1337/api/members");
      setMembers(res.data.filter(m => m.status === "Active"));
    } catch (error) {
      console.error("Error fetching members for scanner:", error);
    }
  };

  // Synthesize beep sound in browser using Web Audio API
  const playBeep = (isSuccess) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (isSuccess) {
        // Success: Clean, high-pitched positive chime
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5 note
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        oscillator.stop(audioCtx.currentTime + 0.15);
      } else {
        // Failure: Double low sawtooth buzzes
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3 note
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        oscillator.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio Context not supported or blocked by user policy:", e);
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
      playBeep(false);
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setLoading(true);

    // Simulate physical scanning delay (800ms)
    setTimeout(async () => {
      try {
        let checkInTimeOverride = null;
        if (simulateLate) {
          // Add 45 minutes to trigger the "Late" logic
          checkInTimeOverride = new Date(Date.now() + 45 * 60 * 1000).toISOString();
        }

        const endpoint = scanAction === "check-in" ? "check-in" : "check-out";
        const payload = {
          studentId: idToScan.trim(),
          eventId: selectedEventId,
        };

        if (scanAction === "check-in" && checkInTimeOverride) {
          payload.checkInTime = checkInTimeOverride;
        }

        const res = await axios.post(`http://localhost:1337/api/attendance/${endpoint}`, payload);
        
        setScanResult({
          success: true,
          message: res.data.message,
          data: res.data.attendance,
        });
        playBeep(true);
        if (onScanSuccess) {
          onScanSuccess();
        }
      } catch (error) {
        console.error(error);
        setScanResult({
          success: false,
          message: error.response?.data?.message || "Internal server error. Code: 500",
        });
        playBeep(false);
      } finally {
        setIsScanning(false);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: "600", borderBottom: "1px solid var(--border-glow)", paddingBottom: "12px", textAlign: "left" }}>
        Terminal Simulation
      </h3>

      <form onSubmit={handleScan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Check-In / Check-Out Selector */}
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="button"
            onClick={() => setScanAction("check-in")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "var(--border-radius-md)",
              border: scanAction === "check-in" ? "1px solid var(--accent-cyan)" : "1px solid var(--border-glow)",
              background: scanAction === "check-in" ? "rgba(0, 242, 254, 0.05)" : "transparent",
              color: scanAction === "check-in" ? "var(--accent-cyan)" : "var(--text-secondary)",
              fontWeight: "600",
              textTransform: "none",
              fontSize: "15px",
              transition: "var(--transition-smooth)"
            }}
          >
            Check-In
          </Button>
          <Button
            type="button"
            onClick={() => setScanAction("check-out")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "var(--border-radius-md)",
              border: scanAction === "check-out" ? "1px solid var(--accent-cyan)" : "1px solid var(--border-glow)",
              background: scanAction === "check-out" ? "rgba(0, 242, 254, 0.05)" : "transparent",
              color: scanAction === "check-out" ? "var(--accent-cyan)" : "var(--text-secondary)",
              fontWeight: "600",
              textTransform: "none",
              fontSize: "15px",
              transition: "var(--transition-smooth)"
            }}
          >
            Check-Out
          </Button>
        </div>

        {/* Member dropdown list */}
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

        {/* Manual input ID */}
        <TextField
          label="Student ID (e.g. 2023-10001)"
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

        {scanAction === "check-in" && (
          <FormControlLabel
            control={
              <Checkbox
                checked={simulateLate}
                onChange={(e) => setSimulateLate(e.target.checked)}
                style={{ color: "var(--accent-cyan)" }}
              />
            }
            label={<span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Simulate Late check-in (+45 mins event offset)</span>}
          />
        )}

        {/* Visual Scanner Area */}
        <div
          className={`glass-panel ${isScanning ? "pulse-scanning" : ""}`}
          style={{
            height: "180px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: isScanning ? "rgba(0, 242, 254, 0.02)" : "rgba(255,255,255,0.01)",
            border: "1px dashed rgba(255, 255, 255, 0.15)",
            borderRadius: "var(--border-radius-lg)",
            marginTop: "10px",
          }}
        >
          {isScanning && <div className="scanner-laser"></div>}
          
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isScanning ? "var(--accent-cyan)" : "var(--text-secondary)"}
            strokeWidth="1.5"
            style={{
              transition: "var(--transition-smooth)",
              filter: isScanning ? "drop-shadow(0 0 10px rgba(0,242,254,0.4))" : "none",
              marginBottom: "12px"
            }}
          >
            <path d="M12 2a10 10 0 0 1 10 10c0 2.2-.7 4.2-1.9 5.8" strokeLinecap="round"/>
            <path d="M12 6a6 6 0 0 1 6 6c0 1.5-.6 2.8-1.5 3.8" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M2 12A10 10 0 0 1 12 2" strokeLinecap="round" strokeDasharray="3 3"/>
            <path d="M2.1 17.8A10 10 0 0 0 12 22" strokeLinecap="round"/>
          </svg>

          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: isScanning ? "var(--accent-cyan)" : "var(--text-secondary)",
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}
          >
            {isScanning ? "Reading RFID/QR Device..." : "Position card to tap"}
          </span>
        </div>

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
          {loading ? <CircularProgress size={24} style={{ color: "#090b0f" }} /> : `Simulate Tap (${scanAction === "check-in" ? "IN" : "OUT"})`}
        </Button>
      </form>

      {/* Scan Results Display */}
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
              {scanResult.data.checkOut && (
                <>
                  <span>Checked Out:</span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {new Date(scanResult.data.checkOut).toLocaleTimeString()}
                  </strong>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendanceScanner;
