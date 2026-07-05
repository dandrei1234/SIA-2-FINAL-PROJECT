import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chip, Alert } from "@mui/material";

function EventsPlaceholder() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:1337/api/events");
      setEvents(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Ongoing": return "var(--accent-green)";
      case "Upcoming": return "var(--accent-cyan)";
      case "Completed": return "var(--text-muted)";
      default: return "var(--accent-red)";
    }
  };

  return (
    <div style={{ padding: "8px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1, overflowY: "auto", height: "100vh" }}>
      <div style={{ textAlign: "left", borderBottom: "1px solid var(--border-glow)", paddingBottom: "16px" }}>
        <h1 className="gradient-text" style={{ fontSize: "28px", margin: 0, fontWeight: "800", fontFamily: "var(--font-heading)" }}>
          Events Management Module
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Assigned to: <strong>Timothy Sancho Tabangin</strong> | Active Database Schema Integration Interface
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {events.length === 0 ? (
          <div className="glass-panel" style={{ padding: "40px", gridColumn: "1 / -1", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)" }}>No events currently logged in database.</p>
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev._id} className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", fontFamily: "var(--font-heading)", color: "var(--text-primary)", margin: 0 }}>
                  {ev.title}
                </h3>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: getStatusColor(ev.status),
                  border: `1px solid ${getStatusColor(ev.status)}`,
                  padding: "2px 8px",
                  borderRadius: "10px",
                  textTransform: "uppercase"
                }}>{ev.status}</span>
              </div>

              {ev.description && (
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", minHeight: "36px" }}>
                  {ev.description}
                </p>
              )}

              <div style={{ borderTop: "1px solid var(--border-glow)", paddingTop: "10px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px", color: "var(--text-secondary)" }}>
                <div>📅 <strong>Date:</strong> {new Date(ev.date).toLocaleDateString()} {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div>📍 <strong>Venue:</strong> {ev.venue || "N/A"}</div>
                <div>👥 <strong>Capacity:</strong> {ev.capacity || "Unlimited"} registered users max</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EventsPlaceholder;
