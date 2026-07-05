import React, { useState, useEffect } from "react";
import axios from "axios";

function AttendanceStats({ eventId, refreshTrigger }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetchStats();
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

  if (!eventId || !stats) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "20px", background: "rgba(0, 0, 0, 0.02)", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-glow)", justifyContent: "space-around" }}>
      <div style={{ textAlign: "center", minWidth: "100px" }}>
        <p style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-cyan)", margin: 0 }}>{stats.checkInCount}</p>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Total Logged</span>
      </div>
      
      <div style={{ width: "1px", background: "var(--border-glow)", margin: "0 10px" }}></div>
      
      <div style={{ textAlign: "center", minWidth: "100px" }}>
        <p style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-green)", margin: 0 }}>{stats.presentCount}</p>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>On Time</span>
      </div>

      <div style={{ width: "1px", background: "var(--border-glow)", margin: "0 10px" }}></div>
      
      <div style={{ textAlign: "center", minWidth: "100px" }}>
        <p style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-yellow)", margin: 0 }}>{stats.lateCount}</p>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Late</span>
      </div>

      <div style={{ width: "1px", background: "var(--border-glow)", margin: "0 10px" }}></div>
      
      <div style={{ textAlign: "center", minWidth: "100px" }}>
        <p style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-red)", margin: 0 }}>{stats.absentCount}</p>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Absent</span>
      </div>
    </div>
  );
}

export default AttendanceStats;
