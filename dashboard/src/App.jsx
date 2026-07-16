import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AttendanceDashboard from "./pages/AttendanceDashboard";

function App() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "attendance":
        return <AttendanceDashboard onOpenSidebar={() => setSidebarOpen(true)} />;
      default:
        return <AttendanceDashboard onOpenSidebar={() => setSidebarOpen(true)} />;
    }
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden", backgroundColor: "var(--bg-space)" }}>
      {/* Overlay for mobile sidebar */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* On mobile: sidebar floats as overlay. On desktop: sidebar is in the flex layout */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Page Content Viewport */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
