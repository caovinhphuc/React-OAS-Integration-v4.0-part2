import { navigationData } from "../../data/navigationData";
import AlertTest from "../AlertTest";
import GoogleDriveTest from "../GoogleDriveTest";
import GoogleSheetsTest from "../GoogleSheetsTest";
import ReportDashboard from "../ReportDashboard";

const TabContent = ({ activeTab }) => {
  const getComponent = (tabId) => {
    const tab = navigationData.tabs.find((tab) => tab.id === tabId);
    if (!tab) return <GoogleSheetsTest />;

    switch (tab.component) {
      case "GoogleSheetsTest":
        return <GoogleSheetsTest />;
      case "GoogleDriveTest":
        return <GoogleDriveTest />;
      case "AlertTest":
        return <AlertTest />;
      case "ReportDashboard":
        return <ReportDashboard />;
      default:
        return <GoogleSheetsTest />;
    }
  };

  return (
    <div className="content-wrapper">
      {getComponent(activeTab)}
    </div>
  );
};

export default TabContent;
