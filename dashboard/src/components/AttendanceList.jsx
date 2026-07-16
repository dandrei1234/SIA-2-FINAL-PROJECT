import React, { useState, useEffect } from "react";
import axios from "axios";

function AttendanceList({ eventId, refreshTrigger, onRecordChange }) {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchRecords();
    }
  }, [eventId, refreshTrigger]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const membersRes = await axios.get(`http://localhost:1337/api/members`);
      const allMembers = membersRes.data;

      let attendanceRecords = [];
      if (eventId) {
        const attRes = await axios.get(`http://localhost:1337/api/attendance/event/${eventId}`);
        attendanceRecords = attRes.data;
      }

      const merged = allMembers.map(member => {
        const record = attendanceRecords.find(r => r.member && r.member._id === member._id);
        return {
          _id: record ? record._id : `virtual-${member._id}`,
          member: member,
          event: record ? record.event : { _id: eventId },
          checkIn: record ? record.checkIn : null,
          checkOut: record ? record.checkOut : null,
          status: record ? record.status : "-",
          remarks: record ? record.remarks : "",
          isVirtual: !record
        };
      });

      setRecords(merged);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (record, newStatus) => {
    if (!eventId) {
      alert("No event selected! Please make sure an event exists.");
      return;
    }
    try {
      const payload = {
        member: record.member._id,
        event: eventId,
        status: newStatus,
        checkIn: newStatus === 'Present' && !record.checkIn ? new Date() : record.checkIn
      };

      await axios.post(`http://localhost:1337/api/attendance`, payload);
      fetchRecords();
      if (onRecordChange) onRecordChange();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status: " + (error.response?.data?.message || error.message));
    }
  };

  const filteredRecords = records.filter((r) => {
    const student = r.member || {};
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = fullName.includes(searchLower) || (student.studentId || "").toLowerCase().includes(searchLower);

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && r.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present": return { bg: "var(--accent-green-glow)", color: "var(--accent-green)", border: "rgba(16, 185, 129, 0.2)" };
      case "absent": return { bg: "var(--accent-red-glow)", color: "var(--accent-red)", border: "rgba(123, 17, 19, 0.2)" };
      default: return { bg: "var(--bg-space)", color: "var(--text-secondary)", border: "var(--border-glow)" };
    }
  };

  const FilterButton = ({ label, value }) => (
    <button
      onClick={() => setStatusFilter(value)}
      style={{
        background: statusFilter === value ? "rgba(99, 102, 241, 0.1)" : "transparent",
        border: statusFilter === value ? "1px solid var(--accent-cyan)" : "1px solid transparent",
        color: statusFilter === value ? "var(--text-primary)" : "var(--text-secondary)",
        padding: "6px 16px",
        borderRadius: "100px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ background: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border-glow)", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Filters & Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px", background: "var(--bg-space)", padding: "4px", borderRadius: "100px" }}>
          <FilterButton label="All" value="all" />
          <FilterButton label="Present" value="present" />
          <FilterButton label="Absent" value="absent" />
        </div>

        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--accent-cyan)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search member..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "var(--bg-space)", border: "1px solid var(--border-glow)",
              color: "var(--text-primary)", padding: "10px 16px 10px 40px", borderRadius: "100px",
              fontSize: "13px", outline: "none", minWidth: "240px"
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        {!eventId ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border-glow)", borderRadius: "8px", marginTop: "16px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px", opacity: 0.5 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "var(--text-primary)" }}>No Active Event</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>Please create and select an event to start checking attendance.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border-glow)" }}>
                <th style={{ padding: "16px 8px", fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>Student ID</th>
                <th style={{ padding: "16px 8px", fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>Student Name</th>
                <th style={{ padding: "16px 8px", fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>Course</th>
                <th style={{ padding: "16px 8px", fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>Time In</th>
                <th style={{ padding: "16px 8px", fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>Status</th>
                <th style={{ padding: "16px 8px", fontWeight: "600", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "right" }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading records...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No members found</td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const colors = getStatusColor(r.status);

                  return (
                    <tr key={r._id} style={{ borderBottom: "1px solid var(--border-glow)" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ background: "var(--accent-cyan-glow)", color: "var(--accent-cyan)", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", border: "1px solid var(--accent-cyan-glow)" }}>
                          {r.member.studentId}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", fontWeight: "600", color: "var(--text-primary)" }}>
                        {r.member ? `${r.member.firstName} ${r.member.lastName}` : "Unknown"}
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text-secondary)", fontSize: "12px" }}>
                        {r.member && r.member.course ? r.member.course : "—"}
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`, padding: "4px 12px", borderRadius: "100px", fontSize: "11px", fontWeight: "600" }}>
                          {r.status || "Absent"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button onClick={() => handleToggleStatus(r, 'Present')} style={{ background: "var(--accent-green-glow)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "4px 10px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--accent-green)", fontSize: "11px", fontWeight: "600" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Present
                          </button>
                          <button onClick={() => handleToggleStatus(r, 'Absent')} style={{ background: "var(--accent-red-glow)", border: "1px solid rgba(123, 17, 19, 0.2)", padding: "4px 10px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--accent-red)", fontSize: "11px", fontWeight: "600" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
          {filteredRecords.length} total registered members
        </div>
      </div>
    </div>
  );
}

export default AttendanceList;
