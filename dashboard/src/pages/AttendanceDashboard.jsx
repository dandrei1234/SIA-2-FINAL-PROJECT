import React, { useState, useEffect } from "react";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, Tab, Tabs, Box } from "@mui/material";
import AttendanceScanner from "../components/AttendanceScanner";
import AttendanceList from "../components/AttendanceList";
import AttendanceStats from "../components/AttendanceStats";

function AttendanceDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEvents, setLoadingEvents] = useState(false);
  
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState(0);

  // Seeding state
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState(null);
  
  // Collapsible guide state
  const [showGuide, setShowGuide] = useState(true);

  // Event creation state
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventCap, setEventCap] = useState("100");

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await axios.get("http://localhost:1337/api/events");
      setEvents(res.data);
      if (res.data.length > 0 && !selectedEventId) {
        setSelectedEventId(res.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const ev = events.find(e => e._id === selectedEventId);
      setSelectedEvent(ev);
    } else {
      setSelectedEvent(null);
    }
  }, [selectedEventId, events]);

  const handleScanSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    setSeedStatus(null);
    try {
      const response = await axios.post("http://localhost:1337/api/attendance/seed-data");
      setSeedStatus({
        type: "success",
        message: "Database successfully initialized with mock students, events, and records!",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setSeedStatus({
        type: "error",
        message: "Failed to connect to local database server. Make sure the Node app is running on port 1337.",
      });
    } finally {
      setSeedLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDate) return;
    try {
      await axios.post("http://localhost:1337/api/events", {
        title: eventTitle,
        description: eventDesc,
        date: new Date(eventDate),
        venue: eventVenue,
        capacity: parseInt(eventCap) || 100,
        status: "Upcoming"
      });
      setNewEventOpen(false);
      setEventTitle("");
      setEventDesc("");
      setEventDate("");
      setEventVenue("");
      setEventCap("100");
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
  };

  return (
    <div style={{ padding: "16px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "20px", flex: 1, overflowY: "auto", height: "100vh" }}>
      
      {/* Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glow)", paddingBottom: "12px" }}>
        <div style={{ textAlign: "left" }}>
          <h1 className="gradient-text" style={{ fontSize: "24px", margin: 0, fontWeight: "800", fontFamily: "var(--font-heading)" }}>
            Attendance & Registry System
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px" }}>
            Manage checking in, student status logs, and turnouts easily.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="outlined"
            onClick={handleSeed}
            disabled={seedLoading}
            style={{
              borderColor: "var(--accent-violet)",
              color: "var(--accent-violet)",
              fontWeight: "700",
              textTransform: "none",
              borderRadius: "var(--border-radius-md)",
              padding: "6px 14px",
              fontSize: "14px"
            }}
          >
            {seedLoading ? <CircularProgress size={16} style={{ color: "var(--accent-violet)" }} /> : "Auto Seed Database"}
          </Button>

          <Button
            variant="contained"
            onClick={() => setNewEventOpen(true)}
            style={{
              background: "var(--accent-cyan)",
              color: "#ffffff",
              fontWeight: "700",
              textTransform: "none",
              borderRadius: "var(--border-radius-md)",
              padding: "6px 14px",
              fontSize: "14px"
            }}
          >
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Onboarding Assistant Guide */}
      {showGuide && (
        <Alert
          severity="info"
          style={{
            backgroundColor: "rgba(0, 242, 254, 0.05)",
            border: "1px solid var(--accent-cyan-glow)",
            color: "var(--text-primary)",
            borderRadius: "var(--border-radius-md)",
            fontSize: "14px",
            textAlign: "left"
          }}
          onClose={() => setShowGuide(false)}
        >
          <strong>Quick Start Guide:</strong>
          <ol style={{ marginLeft: "20px", marginTop: "4px" }}>
            <li>Click <strong>Auto Seed Database</strong> at the top right to pre-populate mock students and events.</li>
            <li>Select an event in the control panel below.</li>
            <li>Use the <strong>Kiosk Scan Station</strong> tab to simulate students checking in, or go to <strong>Registry Logs</strong> to view or edit logs manually!</li>
          </ol>
        </Alert>
      )}

      {/* Seed feedback status alerts */}
      {seedStatus && (
        <Alert
          severity={seedStatus.type}
          style={{
            backgroundColor: seedStatus.type === "success" ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
            border: `1px solid ${seedStatus.type === "success" ? "var(--accent-green)" : "var(--accent-red)"}`,
            color: "var(--text-primary)",
            borderRadius: "var(--border-radius-md)",
            fontSize: "13px",
            textAlign: "left"
          }}
          onClose={() => setSeedStatus(null)}
        >
          {seedStatus.message}
        </Alert>
      )}

      {/* Simplified Event Selector Card */}
      <div className="glass-panel" style={{ padding: "16px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", textAlign: "left" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <FormControl size="small" style={{ minWidth: "240px" }}>
            <InputLabel id="event-select-label" style={{ color: "var(--text-secondary)" }}>Choose Active Event</InputLabel>
            <Select
              labelId="event-select-label"
              value={selectedEventId}
              label="Choose Active Event"
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ color: "var(--text-primary)", borderRadius: "var(--border-radius-md)" }}
            >
              {loadingEvents && events.length === 0 ? (
                <MenuItem value="" disabled>Loading events...</MenuItem>
              ) : events.length === 0 ? (
                <MenuItem value="" disabled>No events. Click Auto Seed at the top!</MenuItem>
              ) : (
                events.map(ev => (
                  <MenuItem key={ev._id} value={ev._id}>
                    {ev.title} ({new Date(ev.date).toLocaleDateString()})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {selectedEvent && (
            <div style={{ display: "flex", gap: "12px", fontSize: "14px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
              <div><strong>Venue:</strong> {selectedEvent.venue || "N/A"}</div>
              <div><strong>Capacity:</strong> {selectedEvent.capacity || "Unlimited"}</div>
              <div><strong>Status:</strong> <span style={{ color: "var(--accent-cyan)" }}>{selectedEvent.status}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Page Navigation Tabs */}
      {selectedEventId && (
        <Box style={{ borderBottom: "1px solid var(--border-glow)", width: "100%" }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            TabIndicatorProps={{ style: { backgroundColor: "var(--accent-cyan)" } }}
            style={{ minHeight: "auto" }}
          >
            <Tab
              label="Kiosk Scan Station"
              style={{
                color: activeTab === 0 ? "var(--accent-cyan)" : "var(--text-secondary)",
                textTransform: "none",
                fontWeight: "600",
                fontSize: "16px",
                padding: "8px 16px",
                minHeight: "auto"
              }}
            />
            <Tab
              label="Registry Logs"
              style={{
                color: activeTab === 1 ? "var(--accent-cyan)" : "var(--text-secondary)",
                textTransform: "none",
                fontWeight: "600",
                fontSize: "16px",
                padding: "8px 16px",
                minHeight: "auto"
              }}
            />
          </Tabs>
        </Box>
      )}

      {/* Tab Panels */}
      {selectedEventId ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          {activeTab === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "20px", alignItems: "start" }}>
              {/* Scan controller */}
              <AttendanceScanner
                selectedEventId={selectedEventId}
                onScanSuccess={handleScanSuccess}
                refreshTrigger={refreshTrigger}
              />
              {/* Turnout metrics */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="glass-panel" style={{ padding: "20px", textAlign: "left" }}>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: "600", borderBottom: "1px solid var(--border-glow)", paddingBottom: "10px", marginBottom: "16px" }}>
                    Event Metrics & Status
                  </h3>
                  <AttendanceStats eventId={selectedEventId} refreshTrigger={refreshTrigger} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <AttendanceList
                eventId={selectedEventId}
                refreshTrigger={refreshTrigger}
                onRecordChange={handleScanSuccess}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "60px", color: "var(--text-secondary)" }}>
          <h3>Welcome to the Attendance Ecosystem!</h3>
          <p style={{ marginTop: "8px", fontSize: "16px" }}>
            Click <strong>Auto Seed Database</strong> at the top right to start immediately.
          </p>
        </div>
      )}

      {/* Add New Event Dialog */}
      <Dialog open={newEventOpen} onClose={() => setNewEventOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ fontFamily: "var(--font-heading)", fontWeight: "600" }}>Schedule New Event</DialogTitle>
        <DialogContent style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "8px" }}>
          <TextField
            label="Event Title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={eventDesc}
            onChange={(e) => setEventDesc(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Event Date & Time"
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Venue Location"
            value={eventVenue}
            onChange={(e) => setEventVenue(e.target.value)}
            fullWidth
          />
          <TextField
            label="Capacity Limit"
            type="number"
            value={eventCap}
            onChange={(e) => setEventCap(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewEventOpen(false)} style={{ color: "var(--text-secondary)" }}>Cancel</Button>
          <Button
            onClick={handleCreateEvent}
            disabled={!eventTitle || !eventDate}
            style={{ color: "var(--accent-cyan)", fontWeight: "600" }}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default AttendanceDashboard;
