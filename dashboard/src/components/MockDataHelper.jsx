import React, { useState } from "react";
import axios from "axios";
import { Button, Alert, CircularProgress } from "@mui/material";

function MockDataHelper({ onSeedCompleted }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSeed = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await axios.post("http://localhost:1337/api/attendance/seed-data");
      setStatus({
        type: "success",
        message: `${response.data.message} Created ${response.data.membersCount} members, ${response.data.eventsCount} events, and ${response.data.attendanceCount} logs.`,
      });
      if (onSeedCompleted) {
        onSeedCompleted();
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to connect to the backend server. Please make sure the node server is running on port 1337.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: "20px",
        marginBottom: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, fontFamily: "var(--font-heading)" }}>
            ⚡ SIA Checkpoint Mock Data Helper
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Initialize MongoDB with mock Members, Events, and Attendance Logs for immediate testing and grading.
          </p>
        </div>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSeed}
          style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
            color: "#090b0f",
            fontWeight: "700",
            textTransform: "none",
            borderRadius: "var(--border-radius-md)",
            padding: "8px 18px",
            boxShadow: "0 4px 14px rgba(0, 242, 254, 0.2)",
          }}
        >
          {loading ? <CircularProgress size={20} style={{ color: "#090b0f" }} /> : "Seed Database"}
        </Button>
      </div>

      {status && (
        <Alert
          severity={status.type}
          style={{
            backgroundColor: status.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${status.type === "success" ? "var(--accent-green)" : "var(--accent-red)"}`,
            color: "var(--text-primary)",
            borderRadius: "var(--border-radius-md)",
            fontSize: "13px",
          }}
          onClose={() => setStatus(null)}
        >
          {status.message}
        </Alert>
      )}
    </div>
  );
}

export default MockDataHelper;
