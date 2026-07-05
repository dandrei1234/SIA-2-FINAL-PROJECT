import React from "react";

function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    {
      id: "attendance",
      label: "Attendance Management",
      author: "Luis Andrei Raymundo",
    },
    {
      id: "members",
      label: "Member Registration",
      author: "John Paul Dres",
    },
    {
      id: "events",
      label: "Events Management",
      author: "Timothy Sancho Tabangin",
    },
    {
      id: "sanctions",
      label: "Sanction Payments",
      author: "Ned Bryne Pinkihan",
      disabled: true,
    },
    {
      id: "admin",
      label: "Admin Dashboard",
      author: "Cecilio Liwag Jr.",
      disabled: true,
    },
  ];

  return (
    <div
      className="glass-panel"
      style={{
        width: "300px",
        minWidth: "300px",
        height: "calc(100vh - 32px)",
        margin: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 16px",
        position: "sticky",
        top: "16px",
      }}
    >
      <div>
        {/* Header Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", padding: "0 8px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            background: "var(--accent-cyan)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
          }}>
            <span style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", fontFamily: "var(--font-heading)" }}>S</span>
          </div>
          <div>
            <h2 style={{ fontSize: "18px", margin: 0, fontWeight: "700", textAlign: "left" }}>SchoolOrg</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, textAlign: "left" }}>Ecosystem Hub</p>
          </div>
        </div>

        {/* Nav list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "var(--border-radius-md)",
                  border: "none",
                  background: isActive ? "rgba(2, 132, 199, 0.08)" : "transparent",
                  color: isActive ? "var(--accent-cyan)" : item.disabled ? "var(--text-muted)" : "var(--text-secondary)",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                  fontSize: "16px",
                  fontWeight: isActive ? "600" : "500",
                  transition: "var(--transition-smooth)",
                  borderLeft: isActive ? "4px solid var(--accent-cyan)" : "4px solid transparent",
                  opacity: item.disabled ? 0.5 : 1,
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !item.disabled) {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.02)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !item.disabled) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span>{item.label}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    By: {item.author} {item.disabled && "(Integration Pend.)"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="glass-panel" style={{ padding: "14px", borderRadius: "var(--border-radius-md)", background: "rgba(0, 0, 0, 0.01)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>STUDENT DEVELOPER</span>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Luis Andrei Raymundo</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-green)" }}></span>
            <span style={{ fontSize: "11px", color: "var(--accent-green)" }}>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
