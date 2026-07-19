import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import AttendanceScanner from "../components/AttendanceScanner";
import AttendanceList from "../components/AttendanceList";
import AttendanceStats from "../components/AttendanceStats";

function AttendanceDashboard({ onOpenSidebar }) {
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Attendance session state: stored per event in localStorage
  // attendanceSessions = { [eventId]: "open" | "closed" }
  const [attendanceSessions, setAttendanceSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("attendanceSessions") || "{}");
    } catch { return {}; }
  });

  const isAttendanceOpen = selectedEventId ? (attendanceSessions[selectedEventId] === "open") : false;

  const openAttendance = () => {
    const updated = { ...attendanceSessions, [selectedEventId]: "open" };
    setAttendanceSessions(updated);
    localStorage.setItem("attendanceSessions", JSON.stringify(updated));
  };

  const closeAttendance = async () => {
    try {
      // Mark the event as completed in the database
      await axios.put(`${API_URL}/events/${selectedEventId}`, { status: "completed" });
    } catch (error) {
      console.error("Failed to update event status:", error);
    }
    const updated = { ...attendanceSessions, [selectedEventId]: "closed" };
    setAttendanceSessions(updated);
    localStorage.setItem("attendanceSessions", JSON.stringify(updated));
    setScannerOpen(false);
    // Refresh events so it moves to Completed Events tab
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const filteredEvents = events.filter(ev => {
    if (statusFilter === "all") return true;
    return (ev.status || "").toLowerCase() === statusFilter.toLowerCase();
  });

  const selectedEvent = filteredEvents.find(ev => ev._id === selectedEventId) || null;
  const isCompleted = selectedEvent ? /^completed$/i.test(selectedEvent.status) : false;
  const attendanceClosed = selectedEventId ? (attendanceSessions[selectedEventId] === "closed") : false;
  // Locked = event is completed OR admin manually closed attendance
  const isLocked = isCompleted || attendanceClosed;

  useEffect(() => {
    if (filteredEvents.length > 0) {
      const currentInFiltered = filteredEvents.find(ev => ev._id === selectedEventId);
      if (!currentInFiltered) {
        setSelectedEventId(filteredEvents[0]._id);
      }
    } else {
      setSelectedEventId("");
    }
  }, [statusFilter, events]);

  const handleScanSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", height: "100vh", background: "var(--bg-space)", color: "var(--text-primary)" }}>

      {/* Top Navigation Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid var(--border-glow)", background: "var(--bg-panel)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Hamburger button - only visible on mobile */}
          <button className="hamburger-btn" onClick={onOpenSidebar} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h2 style={{ fontSize: "16px", margin: 0, fontWeight: "600" }}>Attendance</h2>
          </div>
        </div>
      </div>

      <div className="main-content-pad" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Section */}
        <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", margin: 0, fontWeight: "700" }}>Attendance</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px", margin: 0 }}>
              Monitor member attendance across all events
            </p>
          </div>
          <div className="dashboard-controls" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Event Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: "var(--bg-space)",
                border: "1px solid var(--border-glow)",
                color: "var(--text-primary)",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                minWidth: "150px"
              }}
            >
              <option value="active" style={{ background: "var(--bg-panel)", color: "var(--text-primary)" }}>Active Events</option>
              <option value="completed" style={{ background: "var(--bg-panel)", color: "var(--text-primary)" }}>Completed Events</option>
              <option value="all" style={{ background: "var(--bg-panel)", color: "var(--text-primary)" }}>All Events</option>
            </select>

            {/* Event Picker */}
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
              {filteredEvents.length === 0 ? (
                <option value="">No Events Available</option>
              ) : (
                filteredEvents.map(ev => (
                  <option key={ev._id} value={ev._id} style={{ background: "var(--bg-panel)", color: "var(--text-primary)" }}>
                    {ev.title}
                  </option>
                ))
              )}
            </select>

            {/* Action Button based on state */}
            {isCompleted ? (
              // Completed event — locked
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", padding: "10px 16px", border: "1px solid var(--border-glow)", borderRadius: "8px" }}>
                🔒 Event Completed
              </span>
            ) : !isAttendanceOpen ? (
              // Attendance not yet opened — show Open button
              <button
                onClick={openAttendance}
                disabled={!selectedEventId}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#7b1113", color: "#fff",
                  border: "none", padding: "10px 20px", borderRadius: "8px",
                  fontWeight: "600", fontSize: "14px",
                  cursor: selectedEventId ? "pointer" : "not-allowed",
                  boxShadow: "0 4px 14px rgba(123,17,19,0.35)",
                  opacity: selectedEventId ? 1 : 0.5,
                  transition: "all 0.2s"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Open Attendance
              </button>
            ) : (
              // Attendance is open — show scanner + close button
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {/* Green pulsing dot to show attendance is live */}
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#10b981", fontWeight: "600" }}>
                  <span style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                    animation: "pulse-dot 1.5s infinite"
                  }} />
                  Attendance Open
                </span>

                {/* Undo button — cancels open without closing the event */}
                <button
                  onClick={() => {
                    const updated = { ...attendanceSessions };
                    delete updated[selectedEventId];
                    setAttendanceSessions(updated);
                    localStorage.setItem("attendanceSessions", JSON.stringify(updated));
                  }}
                  title="Undo — go back to before opening attendance"
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "transparent", color: "var(--text-muted)",
                    border: "1px solid var(--border-glow)", padding: "10px 14px", borderRadius: "8px",
                    fontWeight: "500", fontSize: "13px", cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-space)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 14 4 9 9 4"></polyline>
                    <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                  </svg>
                  Undo
                </button>

                <button
                  onClick={closeAttendance}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "transparent", color: "#ef4444",
                    border: "1px solid #ef4444", padding: "10px 16px", borderRadius: "8px",
                    fontWeight: "600", fontSize: "14px", cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Close Attendance
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <AttendanceStats eventId={selectedEventId} refreshTrigger={refreshTrigger} />

        {/* List Section */}
        <AttendanceList eventId={selectedEventId} refreshTrigger={refreshTrigger} onRecordChange={handleScanSuccess} isLocked={isLocked} />

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
