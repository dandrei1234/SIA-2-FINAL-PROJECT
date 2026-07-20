import React from "react";

function Navbar({ activeTab, setActiveTab, sidebarOpen, onClose, isMobile }) {
  const navItems = [
    {
      id: "attendance",
      label: "Attendance",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
        </svg>
      )
    },
  ];

  return (
    <div
      className={`glass-panel mobile-sidebar${sidebarOpen ? " open" : ""}`}
      style={{
        display: isMobile && !sidebarOpen ? "none" : "flex",
        width: "300px",
        minWidth: "300px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 0",
        position: "sticky",
        top: "0",
        background: "var(--bg-panel-solid)",
        borderRight: "1px solid var(--border-glow)",
        borderRadius: "0",
        margin: "0",
      }}
    >
      <div>
        {/* Header Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", padding: "0 24px" }}>
          <img src="/logo.png" alt="SEAIT Logo" style={{ width: "48px", height: "48px", objectFit: "contain", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "12px", margin: 0, fontWeight: "700", color: "var(--text-primary)", letterSpacing: "0.3px", lineHeight: "1.4" }}>
              School of Engineering,<br />Architecture &amp; IT
            </h2>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "3px" }}>
              Attendance Management
            </span>
          </div>
        </div>

        {/* MAIN Section Header */}
        <div style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", borderTop: "1px solid var(--border-glow)" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", letterSpacing: "1px" }}>MAIN</span>
        </div>

        {/* Nav list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 12px" }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id || true; // Force active since it's the only tab
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: isActive ? "var(--accent-cyan-glow)" : "transparent",
                  color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "500",
                  transition: "var(--transition-smooth)",
                  outline: "none",
                  borderLeft: isActive ? "3px solid var(--accent-cyan)" : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--border-glow)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <div style={{ color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </div>
                <span style={{ color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)" }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Back to Admin Button */}
      <div style={{ padding: "0 12px 8px" }}>
        <a
          href="https://school-organization-management-ecos.vercel.app/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "rgba(123,17,19,0.08)",
            border: "1px solid rgba(123,17,19,0.2)",
            color: "#7b1113",
            fontSize: "14px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "all 0.2s",
            cursor: "pointer"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(123,17,19,0.15)";
            e.currentTarget.style.borderColor = "#7b1113";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(123,17,19,0.08)";
            e.currentTarget.style.borderColor = "rgba(123,17,19,0.2)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Admin
        </a>
      </div>
    </div>
  );
}

export default Navbar;
