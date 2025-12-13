# 🔑 **THÔNG TIN ĐĂNG NHẬP - MIA.VN PLATFORM**

## 📊 **TÀI KHOẢN CÓ SẴN**

### **1. Admin Account (Quản trị viên)**

- **Email**: `admin@mia.vn`
- **Mật khẩu**: `admin123`
- **Quyền**: Admin (full access)
- **Chức năng**: Quản lý toàn bộ hệ thống

### **2. Manager Account (Quản lý)**

- **Email**: `manager@mia.vn`
- **Mật khẩu**: `manager123`
- **Quyền**: Manager (read + write + manage)
- **Chức năng**: Quản lý nhân viên và dữ liệu

### **3. Demo Account (Dễ nhớ)**

- **Email**: `demo@mia.vn`
- **Mật khẩu**: `123456`
- **Quyền**: User (read + write)
- **Chức năng**: Demo và test features

### **4. User Account**

- **Email**: `user@mia.vn`
- **Mật khẩu**: `user123`
- **Quyền**: User (read only)
- **Chức năng**: Xem dữ liệu

### **5. Test Account**

- **Email**: `test@mia.vn`
- **Mật khẩu**: `test123`
- **Quyền**: User (read + write)
- **Chức năng**: Testing và development

### **6. Guest Account**

- **Email**: `guest@mia.vn`
- **Mật khẩu**: `guest123`
- **Quyền**: Guest (read only)
- **Chức năng**: Khách xem demo

---

## 🚀 **CÁCH ĐĂNG NHẬP**

### **Bước 1: Truy cập trang đăng nhập**

- URL: <http://localhost:3000/login>
- Hoặc: <http://localhost:3000> (sẽ redirect)

### **Bước 2: Nhập thông tin**

- Chọn một trong các tài khoản trên
- Nhập email và password
- Click "Đăng nhập"

### **Bước 3: Truy cập AI Features**

Sau khi đăng nhập thành công:

- Click vào "AI Features" trong sidebar
- Chọn:
  - 🤖 **AI Dashboard** - Basic AI features
  - 🧠 **AI Enhanced** - Advanced ML capabilities
  - 🎯 **AI Demo** - Interactive testing

---

## 🔧 **TROUBLESHOOTING**

### **Nếu không đăng nhập được:**

1. **Clear browser cache và localStorage:**

   ```javascript
   // Mở Developer Tools (F12) và chạy:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Kiểm tra backend đang chạy:**

   ```bash
   curl http://localhost:3003/api/health
   ```

3. **Reset lockout (nếu bị khóa):**

   ```javascript
   // Mở Developer Tools (F12) và chạy:
   localStorage.removeItem('loginAttempts');
   localStorage.removeItem('lockoutTime');
   location.reload();
   ```

### **Test đăng nhập qua API:**

```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@mia.vn","password":"123456"}'
```

---

## 🎯 **RECOMMENDED LOGIN**

### **✨ Để demo và test:**

- **Email**: `demo@mia.vn`
- **Mật khẩu**: `123456`

### **🔧 Để admin functions:**

- **Email**: `admin@mia.vn`
- **Mật khẩu**: `admin123`

---

## 📱 **PLATFORM ACCESS**

### **🌐 Service URLs:**

- **Main App**: <http://localhost:3000>
- **Backend API**: <http://localhost:3003>
- **AI Service**: <http://localhost:8000> (nếu đã khởi động)
- **MIA Logistics**: <http://localhost:5173> (nếu đã khởi động)

### **🎯 AI Dashboard URLs:**

- **AI Dashboard**: <http://localhost:3000/ai-dashboard>
- **AI Enhanced**: <http://localhost:3000/ai-enhanced>
- **AI Demo**: <http://localhost:3000/ai-demo>

---

## 🎉 **SẴN SÀNG SỬ DỤNG!**

**Hãy sử dụng tài khoản `demo@mia.vn` với mật khẩu `123456` để đăng nhập ngay!** 🚀
