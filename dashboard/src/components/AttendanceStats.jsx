import React, { useState, useEffect } from "react";
import axios from "axios";

function AttendanceStats({ eventId, refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetchStats();
      fetchEventData();
    }
  }, [eventId, refreshTrigger]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`http://localhost:1337/api/attendance/stats/${eventId}`);
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchEventData = async () => {
    try {
      const res = await axios.get(`http://localhost:1337/api/events/${eventId}`);
      setEventData(res.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  if (!eventId || !stats) return null;

  // Circular progress math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.attendanceRate / 100) * circumference;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "20px" }}>
      {/* Circle Progress Rate */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative", width: "120px", height: "120px" }}>
          <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
            {/* Background Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Foreground Progress */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="var(--accent-cyan)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "120px",
            height: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "22px", fontWeight: "800", fontFamily: "var(--font-heading)" }}>{stats.attendanceRate}%</span>
            <span style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rate</span>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase" }}>Attendance Rate</h4>
          <p style={{ fontSize: "18px", fontWeight: "700", marginTop: "4px", color: "var(--text-primary)" }}>
            {stats.checkInCount} / {stats.totalMembers}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Active member turnout</p>
        </div>
      </div>

      {/* Present / Late breakdown */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h4 style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Turnout Breakdown</h4>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
            <div>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent-green)" }}>{stats.presentCount}</p>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Present</span>
            </div>
            <div style={{ borderRight: "1px solid var(--border-glow)", margin: "0 10px" }}></div>
            <div>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent-yellow)" }}>{stats.lateCount}</p>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Late Arrivals</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "10px", borderTop: "1px solid var(--border-glow)", paddingTop: "6px" }}>
          *Late arrivals clocked 15m+ past start.
        </div>
      </div>

      {/* Excused / Absent breakdown */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h4 style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Absences & Excuses</h4>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
            <div>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent-red)" }}>{stats.absentCount}</p>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Absent</span>
            </div>
            <div style={{ borderRight: "1px solid var(--border-glow)", margin: "0 10px" }}></div>
            <div>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent-cyan)" }}>{stats.excusedCount}</p>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Excused</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "10px", borderTop: "1px solid var(--border-glow)", paddingTop: "6px" }}>
          Excused records added via registry override.
        </div>
      </div>

      {/* Venue Capacity Status */}
      {eventData && (
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Venue Fill Rate</h4>
            <p style={{ fontSize: "20px", fontWeight: "800", marginTop: "10px" }}>
              {eventData.capacity ? `${Math.round((stats.checkInCount / eventData.capacity) * 100)}%` : "N/A"}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Capacity: {stats.checkInCount} logged / {eventData.capacity || "Unlimited"} spots
            </p>
          </div>
          <div style={{
            height: "6px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "3px",
            overflow: "hidden",
            marginTop: "10px"
          }}>
            <div style={{
              height: "100%",
              width: eventData.capacity ? `${Math.min(100, (stats.checkInCount / eventData.capacity) * 100)}%` : "0%",
              background: stats.checkInCount >= eventData.capacity ? "var(--accent-red)" : "var(--accent-cyan)",
              borderRadius: "3px",
              transition: "width 1s ease-in-out"
            }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceStats;
