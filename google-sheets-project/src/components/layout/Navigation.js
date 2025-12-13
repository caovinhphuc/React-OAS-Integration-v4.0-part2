import React from "react";
import { navigationData } from "../../data/navigationData";
import "./Navigation.css";

const Navigation = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="app-nav">
      <div className="nav-container">
        {navigationData.tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
