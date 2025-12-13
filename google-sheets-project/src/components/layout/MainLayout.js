import { useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import './MainLayout.css';
import Sidebar from './Sidebar';

const MainLayout = ({ activeTab, setActiveTab, configValid, user, showUserInfo = false, children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        configValid={configValid}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="main-content">
        <Header user={user} showUserInfo={showUserInfo} configValid={configValid} />
        
        <div className="content-area">
          {children}
        </div>
        
        <Footer configValid={configValid} />
      </div>
    </div>
  );
};

export default MainLayout;
