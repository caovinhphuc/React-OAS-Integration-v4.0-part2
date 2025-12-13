# 🔧 Hướng Dẫn Cấu Hình Vercel - MIA.vn Google Integration

> **Version:** 1.0.0
> **Last Updated:** 2025-01-24

---

## 📋 Tổng Quan

Sau khi deploy lên Vercel, bạn cần cấu hình **Environment Variables** để ứng dụng hoạt động đúng.

---

## 🎯 Cách 1: Cấu Hình Qua Vercel Dashboard (Khuyến Nghị)

### Bước 1: Truy Cập Vercel Dashboard

1. Mở trình duyệt và vào: **<https://vercel.com/dashboard>**
2. Đăng nhập với tài khoản Vercel của bạn
3. Tìm project: **`git-react/mia-vn-google-integration`**
4. Click vào project

### Bước 2: Vào Settings → Environment Variables

1. Click tab **Settings** (bên trái)
2. Scroll xuống phần **Environment Variables**
3. Click **Add New** để thêm từng biến

### Bước 3: Thêm Các Biến Môi Trường

#### ✅ **BẮT BUỘC (Required)**

Thêm các biến sau với **Environment** = **Production, Preview, Development**:

| Key | Value | Mô Tả |
|-----|-------|-------|
| `REACT_APP_API_URL` | `https://your-backend-api.com` | URL backend API (production) |
| `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID` | `18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As` | Google Sheets ID |
| `REACT_APP_GOOGLE_DRIVE_FOLDER_ID` | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` | Google Drive Folder ID |

#### ⚙️ **TÙY CHỌN (Optional - Khuyến Nghị)**

| Key | Value | Mô Tả |
|-----|-------|-------|
| `REACT_APP_FEATURE_GOOGLE_SHEETS` | `true` | Bật tính năng Google Sheets |
| `REACT_APP_FEATURE_GOOGLE_DRIVE` | `true` | Bật tính năng Google Drive |
| `REACT_APP_FEATURE_AUTOMATION` | `true` | Bật tính năng Automation |
| `REACT_APP_LANGUAGE` | `vi` | Ngôn ngữ (vi/en) |
| `REACT_APP_TIMEZONE` | `Asia/Ho_Chi_Minh` | Múi giờ |
| `REACT_APP_ENVIRONMENT` | `production` | Môi trường |

#### 🔐 **BẢO MẬT (Nếu Cần)**

| Key | Value | Mô Tả |
|-----|-------|-------|
| `REACT_APP_GOOGLE_MAPS_API_KEY` | `your_api_key` | Google Maps API Key (nếu dùng) |
| `REACT_APP_TELEGRAM_CHAT_ID` | `-4818209867` | Telegram Chat ID (nếu dùng) |

### Bước 4: Lưu và Redeploy

1. Sau khi thêm tất cả biến, click **Save**
2. Vào tab **Deployments**
3. Click **...** (3 chấm) trên deployment mới nhất
4. Click **Redeploy**
5. Chọn **Use existing Build Cache** (tùy chọn)
6. Click **Redeploy**

---

## 🚀 Cách 2: Cấu Hình Qua Vercel CLI

### Bước 1: Tạo File `.env.production`

Tạo file `.env.production` trong thư mục root:

```bash
# .env.production
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_AUTOMATION=true
REACT_APP_LANGUAGE=vi
REACT_APP_TIMEZONE=Asia/Ho_Chi_Minh
REACT_APP_ENVIRONMENT=production
```

### Bước 2: Upload Environment Variables

```bash
# Upload từ file .env.production
vercel env add REACT_APP_API_URL production < .env.production

# Hoặc thêm từng biến
vercel env add REACT_APP_API_URL production
# Nhập value khi được hỏi

# Hoặc dùng script tự động (xem bên dưới)
```

---

## 📝 Script Tự Động Cấu Hình

Tạo script để tự động cấu hình:

```bash
# Chạy script
./scripts/configure-vercel-env.sh
```

---

## ✅ Kiểm Tra Cấu Hình

### 1. Kiểm Tra Qua Vercel Dashboard

1. Vào **Settings → Environment Variables**
2. Xác nhận tất cả biến đã được thêm
3. Kiểm tra **Environment** = **Production**

### 2. Kiểm Tra Qua CLI

```bash
# Xem tất cả environment variables
vercel env ls

# Xem giá trị của một biến (sẽ bị ẩn)
vercel env pull .env.vercel
```

### 3. Kiểm Tra Trong Browser

1. Mở ứng dụng production: **<https://mia-warehouse-management-dn9edu8fq.vercel.app>**
2. Mở **Developer Tools** (F12)
3. Vào tab **Console**
4. Gõ: `console.log(process.env)`
5. Kiểm tra các biến `REACT_APP_*`

---

## 🔍 Danh Sách Đầy Đủ Environment Variables

### **API Configuration**

```env
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_API_BASE_URL=https://your-backend-api.com/api
REACT_APP_AI_SERVICE_URL=https://your-ai-service.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_API_RETRY_ATTEMPTS=3
```

### **Google Services**

```env
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
REACT_APP_GOOGLE_APPS_SCRIPT_ID=your_script_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### **Features Flags**

```env
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_GOOGLE_APPS_SCRIPT=true
REACT_APP_FEATURE_TELEGRAM=true
REACT_APP_FEATURE_AUTOMATION=true
REACT_APP_FEATURE_ANALYTICS=true
```

### **UI Configuration**

```env
REACT_APP_THEME=light
REACT_APP_LANGUAGE=vi
REACT_APP_TIMEZONE=Asia/Ho_Chi_Minh
REACT_APP_DATE_FORMAT=DD/MM/YYYY
REACT_APP_TIME_FORMAT=HH:mm
```

### **Performance & Monitoring**

```env
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_MONITORING_ENABLED=true
REACT_APP_HEALTH_CHECK_INTERVAL=30000
REACT_APP_LOG_LEVEL=info
```

### **Security**

```env
REACT_APP_ENABLE_CSP=true
REACT_APP_ENABLE_HSTS=true
REACT_APP_ENABLE_XSS_PROTECTION=true
```

### **External Services (Optional)**

```env
REACT_APP_TELEGRAM_CHAT_ID=-4818209867
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
REACT_APP_HOTJAR_ID=your_hotjar_id
```

---

## 🐛 Troubleshooting

### **Vấn Đề 1: Environment Variables Không Hoạt Động**

**Nguyên nhân:**

- Chưa redeploy sau khi thêm biến
- Biến chưa được set cho **Production** environment
- Tên biến sai (phải bắt đầu bằng `REACT_APP_`)

**Giải pháp:**

1. Kiểm tra lại trong Vercel Dashboard
2. Redeploy lại project
3. Clear browser cache và thử lại

### **Vấn Đề 2: API Calls Fail**

**Nguyên nhân:**

- `REACT_APP_API_URL` chưa được set hoặc sai
- Backend API chưa chạy hoặc CORS chưa được cấu hình

**Giải pháp:**

1. Kiểm tra `REACT_APP_API_URL` trong Vercel Dashboard
2. Test backend API trực tiếp: `curl https://your-backend-api.com/health`
3. Kiểm tra CORS settings trong backend

### **Vấn Đề 3: Google Services Không Hoạt Động**

**Nguyên nhân:**

- Google Sheets/Drive IDs chưa đúng
- Service account chưa được share quyền

**Giải pháp:**

1. Kiểm tra Google Sheets ID trong URL
2. Kiểm tra Google Drive Folder ID
3. Đảm bảo service account có quyền Editor

---

## 📚 Tài Liệu Tham Khảo

- **Vercel Environment Variables**: <https://vercel.com/docs/concepts/projects/environment-variables>
- **Vercel CLI**: <https://vercel.com/docs/cli>
- **React Environment Variables**: <https://create-react-app.dev/docs/adding-custom-environment-variables/>

---

## 🎯 Quick Start Checklist

- [ ] Đăng nhập Vercel Dashboard
- [ ] Vào Settings → Environment Variables
- [ ] Thêm `REACT_APP_API_URL`
- [ ] Thêm `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID`
- [ ] Thêm `REACT_APP_GOOGLE_DRIVE_FOLDER_ID`
- [ ] Thêm các feature flags (optional)
- [ ] Redeploy project
- [ ] Test ứng dụng production
- [ ] Verify environment variables hoạt động

---

**✅ Sau khi hoàn thành, ứng dụng sẽ sẵn sàng sử dụng!**
