import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

const AuthorizationGuide: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hướng dẫn sử dụng Phân quyền hệ thống
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Điều kiện và truy cập
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Yêu cầu quyền settings:view để truy cập trang Phân quyền." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Đường dẫn: /authorization (từ Sidebar: Phân quyền hệ thống)." />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quy trình cấu hình nhanh (80/20)
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="1) Tạo vai trò ở tab 'Vai trò' (Tên, Mô tả)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="2) Gán quyền cho vai trò ở tab 'Quyền' (tick theo nhóm resource)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="3) Tạo người dùng và gán vai trò ở tab 'Người dùng'." />
          </ListItem>
          <ListItem>
            <ListItemText primary="4) Đăng xuất/Đăng nhập lại để áp dụng quyền mới." />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API & Sheet liên quan
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Sheets: Users, Roles, RolePermissions (Google Sheets)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Seed nhanh: POST /api/auth/init (tạo admin mặc định)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Auth APIs: /api/auth/roles, /api/auth/role-permissions, /api/auth/users (CRUD)." />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Kiểm thử nhanh (Smoke test)
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Tạo vai trò chỉ có employees:view, gán cho một user." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Đăng nhập bằng user đó: chỉ xem được trang Nhân viên, không có nút tạo/sửa/xóa." />
          </ListItem>
        </List>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Gợi ý: Nếu không thấy dữ liệu, kiểm tra cấu hình VITE_GOOGLE_SHEETS_ID
          và đảm bảo backend đang chạy.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthorizationGuide;
