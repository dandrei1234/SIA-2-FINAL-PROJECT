import React, { useState } from "react";
import Navbar from "./components/Navbar";
import AttendanceDashboard from "./pages/AttendanceDashboard";
import MembersPlaceholder from "./pages/MembersPlaceholder";
import EventsPlaceholder from "./pages/EventsPlaceholder";

function App() {
  const [activeTab, setActiveTab] = useState("attendance");

  const renderContent = () => {
    switch (activeTab) {
      case "attendance":
        return <AttendanceDashboard />;
      case "members":
        return <MembersPlaceholder />;
      case "events":
        return <EventsPlaceholder />;
      default:
        return <AttendanceDashboard />;
    }
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden", backgroundColor: "var(--bg-space)" }}>
      {/* Sidebar Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Page Content Viewport */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
