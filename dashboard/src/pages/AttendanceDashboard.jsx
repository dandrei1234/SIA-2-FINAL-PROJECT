import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Dialog, DialogContent, DialogTitle, Button, Chip } from "@mui/material";
import AttendanceScanner from "../components/AttendanceScanner";
import AttendanceList from "../components/AttendanceList";
import AttendanceStats from "../components/AttendanceStats";

function AttendanceDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEventId(res.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleScanSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", height: "100vh", background: "var(--bg-space)", color: "var(--text-primary)" }}>

      {/* Top Navigation Bar (Dashboard specific) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid var(--border-glow)", background: "var(--bg-panel)" }}>
        <div>
          <h2 style={{ fontSize: "16px", margin: 0, fontWeight: "600" }}>Attendance</h2>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Tuesday, July 7, 2026</p>
        </div>


      </div>

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", margin: 0, fontWeight: "700" }}>Attendance</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px", margin: 0 }}>
              Monitor member attendance across all events
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                background: "var(--bg-space)",
                border: "1px solid var(--border-glow)",
                color: "var(--text-primary)",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                minWidth: "200px"
              }}
            >
              {events.length === 0 ? (
                <option value="">No Events Available</option>
              ) : (
                events.map(ev => (
                  <option key={ev._id} value={ev._id} style={{ background: "var(--bg-panel)", color: "var(--text-primary)" }}>
                    {ev.title}
                  </option>
                ))
              )}
            </select>

            <button 
              onClick={() => setScannerOpen(true)}
              disabled={!selectedEventId}
              style={{ 
                display: "flex", alignItems: "center", gap: "8px", 
                background: "var(--accent-cyan)", color: "#fff", 
                border: "none", padding: "10px 16px", borderRadius: "8px", 
                fontWeight: "600", fontSize: "14px", cursor: selectedEventId ? "pointer" : "not-allowed",
                boxShadow: "0 4px 14px var(--accent-cyan-glow)",
                opacity: selectedEventId ? 1 : 0.5
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Mark Attendance
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <AttendanceStats eventId={selectedEventId} refreshTrigger={refreshTrigger} />

        {/* List Section */}
        <AttendanceList eventId={selectedEventId} refreshTrigger={refreshTrigger} onRecordChange={handleScanSuccess} />

      </div>

      {/* Scanner Dialog */}
      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { background: "var(--bg-panel-solid)", color: "var(--text-primary)" } }}>
        <DialogTitle style={{ borderBottom: "1px solid var(--border-glow)", paddingBottom: "16px" }}>Record Attendance</DialogTitle>
        <DialogContent style={{ paddingTop: "24px", paddingBottom: "24px" }}>
          <AttendanceScanner selectedEventId={selectedEventId} onScanSuccess={handleScanSuccess} refreshTrigger={refreshTrigger} />
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default AttendanceDashboard;
