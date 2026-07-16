import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

function AttendanceStats({ eventId, refreshTrigger }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetchStats();
    }
  }, [eventId, refreshTrigger]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/attendance/stats/${eventId}`);
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Safe defaults if stats is not yet loaded
  const data = stats || { presentCount: 0, absentCount: 0, checkInCount: 0, totalMembers: 0, attendanceRate: 0 };
  const total = data.totalMembers;
  const attendanceRate = data.attendanceRate;

  const CardStyle = {
    background: "var(--bg-panel)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minWidth: "140px",
    border: "1px solid var(--border-glow)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  };

  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", width: "100%" }}>
      {/* Attendance Rate */}
      <div style={{ ...CardStyle, flex: 1.5 }}>
         <div style={{ position: "relative", display: "inline-flex", marginBottom: "12px" }}>
            <svg width="80" height="80" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-glow)" strokeWidth="8" />
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent-cyan)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * attendanceRate) / 100} strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
               <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>{attendanceRate}%</span>
            </div>
         </div>
         <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>Attendance Rate</span>
      </div>

      <div style={CardStyle}>
        <p style={{ fontSize: "32px", fontWeight: "700", color: "var(--accent-green)", margin: "0 0 4px 0" }}>{data.presentCount}</p>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>Present</span>
      </div>
      
      <div style={CardStyle}>
        <p style={{ fontSize: "32px", fontWeight: "700", color: "var(--accent-red)", margin: "0 0 4px 0" }}>{data.absentCount}</p>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>Absent</span>
      </div>

      <div style={CardStyle}>
        <p style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 4px 0" }}>{total}</p>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>Total</span>
      </div>
    </div>
  );
}

export default AttendanceStats;
