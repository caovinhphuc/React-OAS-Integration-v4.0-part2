import React from "react";
import "./ConfigWarning.css";

const ConfigWarning = () => {
  return (
    <div className="config-warning">
      <div className="warning-content">
        <h3>⚠️ Configuration Required</h3>
        <p>
          Please configure your environment variables before using the
          application. Copy <code>.env.example</code> to <code>.env</code> and
          fill in your Google credentials.
        </p>
        <div className="warning-links">
          <a
            href="https://github.com/caovinhphuc/react-google-integration/blob/main/docs/setup/QUICK_SETUP.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            📋 Quick Setup Guide
          </a>
          <a
            href="https://github.com/caovinhphuc/react-google-integration/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            📚 Full Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConfigWarning;
