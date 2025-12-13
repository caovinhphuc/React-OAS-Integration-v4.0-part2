import { footerData } from "../../data/footerData";
import "./Footer.css";

const Footer = ({ configValid }) => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-icon">🏢</span>
            <h3 className="footer-logo-text">MIA.vn</h3>
          </div>
          <p className="footer-description">
            Nền tảng quản lý kinh doanh thông minh với tích hợp Google APIs. 
            Đơn giản hóa quy trình làm việc và tối ưu hóa hiệu suất doanh nghiệp.
          </p>
        </div>

        {/* Dynamic Sections from footerData */}
        {footerData.sections.map((section, index) => (
          <div key={index} className="footer-section">
            <h4>{section.title}</h4>
            <ul>
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Status Section */}
        <div className="footer-section">
          <h4>🔧 Hệ Thống</h4>
          <div className="status-indicators">
            <div className={`status-item ${configValid ? "ok" : "error"}`}>
              <span className="status-dot"></span>
              Cấu hình: {configValid ? "Hoạt động" : "Cần thiết lập"}
            </div>
            <div className="status-item ok">
              <span className="status-dot"></span>
              Server: Trực tuyến
            </div>
            <div className="status-item warning">
              <span className="status-dot"></span>
              APIs: Đang kết nối
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; 2024 MIA.vn - React Google Integration. 
          Được xây dựng với React, Express và Google APIs.
        </p>
        <ul className="footer-links">
          <li><a href="/privacy">Chính sách bảo mật</a></li>
          <li><a href="/terms">Điều khoản sử dụng</a></li>
          <li><a href="/support">Hỗ trợ</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
