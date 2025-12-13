import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, configValid, isCollapsed, toggleSidebar }) => {
  const [expandedSections, setExpandedSections] = useState({
    utilities: true, // Mở section tiện ích mặc định
  });

  const toggleSection = (sectionId) => {
    if (isCollapsed) return; // Prevent expanding when collapsed
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleFeatureClick = (featureName) => {
    // Show feature info or navigate to relevant tab
    const featureTabMap = {
      'Google Sheets Integration': 'sheets',
      'Google Drive Management': 'drive',
      'Email & Telegram Alerts': 'alerts',
      'Automated Reports': 'reports',
    };

    const tabId = featureTabMap[featureName];
    if (tabId) {
      setActiveTab(tabId);
      // Close the features section after selection
      setExpandedSections((prev) => ({
        ...prev,
        features: false,
      }));
    }
  };

  const handleAIClick = (aiFeature) => {
    // Navigate to AI route
    window.location.href = aiFeature.route;
  };

  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: '🏠',
      title: 'Dashboard',
      description: 'Trang chủ',
    },
  ];

  const utilities = [
    {
      id: 'sheets',
      icon: '📊',
      title: 'Google Sheets',
      description: 'Quản lý dữ liệu',
    },
    {
      id: 'drive',
      icon: '💾',
      title: 'Google Drive',
      description: 'File & thư mục',
    },
    {
      id: 'alerts',
      icon: '🚨',
      title: 'Cảnh báo',
      description: 'Thông báo hệ thống',
    },
    {
      id: 'reports',
      icon: '📈',
      title: 'Báo cáo',
      description: 'Phân tích dữ liệu',
    },
  ];

  const aiFeatures = [
    {
      id: 'ai-dashboard',
      icon: '🤖',
      title: 'AI Dashboard',
      description: 'Trí tuệ nhân tạo cơ bản',
      route: '/ai-dashboard',
    },
    {
      id: 'ai-enhanced',
      icon: '🧠',
      title: 'AI Enhanced',
      description: 'AI nâng cao với ML',
      route: '/ai-enhanced',
    },
    {
      id: 'ai-demo',
      icon: '🎯',
      title: 'AI Demo',
      description: 'Test AI functionality',
      route: '/ai-demo',
    },
  ];

  const quickLinks = [
    {
      title: 'Google Cloud Console',
      url: 'https://console.cloud.google.com',
      icon: '☁️',
    },
    {
      title: 'Google Sheets',
      url: 'https://sheets.google.com',
      icon: '📊',
    },
    {
      title: 'Google Drive',
      url: 'https://drive.google.com',
      icon: '💾',
    },
    {
      title: 'Gmail App Passwords',
      url: 'https://myaccount.google.com/apppasswords',
      icon: '🔑',
    },
  ];

  const documentation = [
    {
      title: 'Full Setup Guide',
      description: 'Hướng dẫn cài đặt đầy đủ',
      url: 'https://github.com/caovinhphuc/react-google-integration/blob/main/README.md',
    },
    {
      title: 'Documentation Index',
      description: 'Tài liệu tổng hợp',
      url: 'https://github.com/caovinhphuc/react-google-integration/blob/main/docs/README.md',
    },
    {
      title: 'Quick Setup',
      description: 'Cài đặt nhanh',
      url: 'https://github.com/caovinhphuc/react-google-integration/blob/main/docs/setup/QUICK_SETUP.md',
    },
    {
      title: 'Project Summary',
      description: 'Tóm tắt dự án',
      url: 'https://github.com/caovinhphuc/react-google-integration/blob/main/docs/project/PROJECT_SUMMARY.md',
    },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        title={isCollapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
      >
        <span className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}>◀</span>
      </button>

      {/* Logo & Brand */}
      <div className="sidebar-header">
        <div className="brand">
          <h2>{isCollapsed ? '📊' : '📊 MIA.vn'}</h2>
          {!isCollapsed && <span>Quản lý thông minh</span>}
        </div>
      </div>

      {/* Configuration Warning */}
      {!configValid && !isCollapsed && (
        <div className="sidebar-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>Cần cấu hình</strong>
            <span>Kiểm tra settings</span>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {/* Dashboard Home */}
        <div className="nav-section">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''} ${
                isCollapsed ? 'collapsed' : ''
              }`}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.title : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Main Features Section */}
        {!isCollapsed && (
          <div className="nav-section">
            <button className="section-header" onClick={() => toggleSection('utilities')}>
              <span className="section-icon">🔧</span>
              <span className="section-title">Tiện ích</span>
              <span className={`expand-icon ${expandedSections.utilities ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.utilities && (
              <div className="submenu">
                {utilities.map((utility) => (
                  <button
                    key={utility.id}
                    className={`submenu-item ${activeTab === utility.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(utility.id)}
                  >
                    <span className="submenu-icon">{utility.icon}</span>
                    <div className="submenu-content">
                      <span className="submenu-title">{utility.title}</span>
                      <span className="submenu-description">{utility.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        {!isCollapsed && (
          <div className="nav-section">
            <button className="section-header" onClick={() => toggleSection('quickLinks')}>
              <span className="section-icon">🔗</span>
              <span className="section-title">Quick Links</span>
              <span className={`expand-icon ${expandedSections.quickLinks ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.quickLinks && (
              <div className="submenu">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    className="submenu-item"
                    onClick={() => handleExternalLink(link.url)}
                  >
                    <span className="submenu-icon">{link.icon}</span>
                    <span className="submenu-title">{link.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documentation */}
        {!isCollapsed && (
          <div className="nav-section">
            <button className="section-header" onClick={() => toggleSection('documentation')}>
              <span className="section-icon">📚</span>
              <span className="section-title">Documentation</span>
              <span className={`expand-icon ${expandedSections.documentation ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.documentation && (
              <div className="submenu">
                {documentation.map((doc, index) => (
                  <button
                    key={index}
                    className="submenu-item"
                    onClick={() => handleExternalLink(doc.url)}
                  >
                    <span className="submenu-icon">📄</span>
                    <div className="submenu-content">
                      <span className="submenu-title">{doc.title}</span>
                      <span className="submenu-desc">{doc.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Features Section */}
        {!isCollapsed && (
          <div className="nav-section">
            <button className="section-header" onClick={() => toggleSection('aiFeatures')}>
              <span className="section-icon">🤖</span>
              <span className="section-title">AI Features</span>
              <span className={`expand-icon ${expandedSections.aiFeatures ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.aiFeatures && (
              <div className="submenu">
                {aiFeatures.map((aiFeature) => (
                  <button
                    key={aiFeature.id}
                    className="submenu-item"
                    onClick={() => handleAIClick(aiFeature)}
                  >
                    <span className="submenu-icon">{aiFeature.icon}</span>
                    <div className="submenu-content">
                      <span className="submenu-title">{aiFeature.title}</span>
                      <span className="submenu-description">{aiFeature.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Features Overview */}
        {!isCollapsed && (
          <div className="nav-section">
            <button className="section-header" onClick={() => toggleSection('features')}>
              <span className="section-icon">🛠️</span>
              <span className="section-title">Features</span>
              <span className={`expand-icon ${expandedSections.features ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.features && (
              <div className="submenu">
                <button
                  className="submenu-item"
                  onClick={() => handleFeatureClick('Google Sheets Integration')}
                >
                  <span className="submenu-icon">📊</span>
                  <span className="submenu-title">Google Sheets Integration</span>
                </button>
                <button
                  className="submenu-item"
                  onClick={() => handleFeatureClick('Google Drive Management')}
                >
                  <span className="submenu-icon">💾</span>
                  <span className="submenu-title">Google Drive Management</span>
                </button>
                <button
                  className="submenu-item"
                  onClick={() => handleFeatureClick('Email & Telegram Alerts')}
                >
                  <span className="submenu-icon">📧</span>
                  <span className="submenu-title">Email & Telegram Alerts</span>
                </button>
                <button
                  className="submenu-item"
                  onClick={() => handleFeatureClick('Automated Reports')}
                >
                  <span className="submenu-icon">📈</span>
                  <span className="submenu-title">Automated Reports</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
