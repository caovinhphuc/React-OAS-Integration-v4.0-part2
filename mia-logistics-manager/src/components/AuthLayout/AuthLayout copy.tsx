// src/components/templates/AuthLayout/AuthLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.scss';

export const AuthLayout: React.FC = () => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>
            <h1>MIA.vn</h1>
            <p>Quản lý kinh doanh thông minh</p>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h3>📊 Dashboard Thông Minh</h3>
              <p>Theo dõi hiệu suất kinh doanh real-time</p>
            </div>
            <div className={styles.feature}>
              <h3>🚀 Tự Động Hóa</h3>
              <p>Giảm thiểu công việc thủ công</p>
            </div>
            <div className={styles.feature}>
              <h3>📈 Báo Cáo Chi Tiết</h3>
              <p>Phân tích sâu dữ liệu kinh doanh</p>
            </div>
          </div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.formContainer}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
