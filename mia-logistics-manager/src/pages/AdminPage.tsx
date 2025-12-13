import React from 'react';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { SecurityGuard } from '../components/security/SecurityGuard';

const AdminPage: React.FC = () => {
  return (
    <SecurityGuard requireAuth={true}>
      <AdminDashboard />
    </SecurityGuard>
  );
};

export default AdminPage;
