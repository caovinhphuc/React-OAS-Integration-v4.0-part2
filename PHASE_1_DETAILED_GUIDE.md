# 🔧 PHASE 1: CHUẨN BỊ MÔI TRƯỜNG - HƯỚNG DẪN CHI TIẾT

## 🎯 MỤC TIÊU

Chuẩn bị môi trường phát triển hoàn chỉnh để chạy cả hai dự án một cách ổn định.

---

## 📋 **BƯỚC 1: KIỂM TRA HỆ THỐNG**

### ✅ 1.1 Kiểm tra Node.js

```bash
# Kiểm tra phiên bản Node.js
node --version

# Kết quả mong đợi: v18.x.x hoặc v20.x.x
# Nếu chưa có: Cài đặt từ https://nodejs.org/
```

### ✅ 1.2 Kiểm tra Python3

```bash
# Kiểm tra phiên bản Python3
python3 --version

# Kết quả mong đợi: Python 3.9.x hoặc 3.11.x
# Nếu chưa có: Cài đặt từ https://python.org/
```

### ✅ 1.3 Kiểm tra npm

```bash
# Kiểm tra phiên bản npm
npm --version

# Kết quả mong đợi: 9.x.x hoặc 10.x.x
```

### ✅ 1.4 Kiểm tra pip

```bash
# Kiểm tra phiên bản pip
pip --version

# Kết quả mong đợi: pip 23.x.x
```

---

## 📋 **BƯỚC 2: CẤU HÌNH GOOGLE SHEETS**

### ✅ 2.1 Tạo Google Cloud Project

1. Truy cập: https://console.cloud.google.com/
2. Đăng nhập bằng Google account
3. Tạo project mới:
   - Tên project: `react-integration-469009`
   - Project ID: `react-integration-469009`
   - Chọn billing account

### ✅ 2.2 Enable Google Sheets API

1. Trong Google Cloud Console
2. Vào **APIs & Services** > **Library**
3. Tìm kiếm "Google Sheets API"
4. Click **Enable**
5. Làm tương tự với "Google Drive API"

### ✅ 2.3 Tạo Service Account

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Điền thông tin:
   - Name: `react-integration-service`
   - ID: `react-integration-service`
   - Description: `Service account for React integration`
4. Click **Create and Continue**
5. Skip role assignment (click **Continue**)
6. Click **Done**

### ✅ 2.4 Tạo JSON Key

1. Trong danh sách Service Accounts
2. Click vào service account vừa tạo
3. Vào tab **Keys**
4. Click **Add Key** > **Create new key**
5. Chọn **JSON** format
6. Click **Create**
7. File JSON sẽ được tải xuống

### ✅ 2.5 Cập nhật cấu hình

1. Mở file JSON vừa tải
2. Copy các thông tin:
   - `client_email`
   - `project_id`
   - `private_key`
3. Cập nhật vào `main-project/env.config.js`
4. Cập nhật vào `google-sheets-project/env.config.js`

### ✅ 2.6 Cấu hình Google Sheets permissions

1. Mở Google Sheets: https://sheets.google.com/
2. Tạo spreadsheet mới hoặc mở spreadsheet hiện có
3. Click **Share** (Chia sẻ)
4. Thêm email service account: `react-integration-service@react-integration-469009.iam.gserviceaccount.com`
5. Chọn quyền **Editor** (Chỉnh sửa)
6. Click **Send** (Gửi)
7. Copy Spreadsheet ID từ URL (phần giữa `/d/` và `/edit`)

---

## 📋 **BƯỚC 3: CÀI ĐẶT DEPENDENCIES**

### ✅ 3.1 Cài đặt dependencies cho Main Project

```bash
# Di chuyển vào thư mục main-project
cd main-project

# Cài đặt Node.js dependencies
npm install --legacy-peer-deps

# Kiểm tra cài đặt thành công
ls node_modules/ | head -5
```

### ✅ 3.2 Cài đặt dependencies cho Google Sheets Project

```bash
# Di chuyển vào thư mục google-sheets-project
cd ../google-sheets-project

# Cài đặt Node.js dependencies
npm install --legacy-peer-deps

# Kiểm tra cài đặt thành công
ls node_modules/ | head -5
```

### ✅ 3.3 Cài đặt Python packages cho AI Service

```bash
# Di chuyển vào thư mục ai-service
cd ../main-project/ai-service

# Tạo virtual environment (tùy chọn)
python3 -m venv venv
source venv/bin/activate  # Trên macOS/Linux

# Cài đặt Python packages
pip install -r requirements.txt

# Kiểm tra cài đặt thành công
pip list | head -10
```

### ✅ 3.4 Cài đặt Python packages cho Automation

```bash
# Di chuyển vào thư mục automation
cd ../automation

# Cài đặt Python packages
pip install -r requirements.txt

# Kiểm tra cài đặt thành công
pip list | head -10
```

---

## 📋 **BƯỚC 4: KIỂM TRA CẤU HÌNH**

### ✅ 4.1 Kiểm tra file cấu hình

```bash
# Kiểm tra main-project config
cat main-project/env.config.js

# Kiểm tra google-sheets-project config
cat google-sheets-project/env.config.js
```

### ✅ 4.2 Kiểm tra Google Sheets credentials

```bash
# Kiểm tra file credentials
ls -la main-project/backend/config/
ls -la google-sheets-project/config/

# Kiểm tra file JSON key
ls -la main-project/backend/config/google-credentials.json
ls -la google-sheets-project/config/google-credentials.json
```

### ✅ 4.3 Kiểm tra port availability

```bash
# Kiểm tra port 3000
lsof -i :3000

# Kiểm tra port 3001
lsof -i :3001

# Kiểm tra port 3002
lsof -i :3002

# Kiểm tra port 3003
lsof -i :3003

# Kiểm tra port 8000
lsof -i :8000

# Nếu có process nào đang chạy, dừng chúng:
# kill -9 <PID>
```

---

## 📋 **BƯỚC 5: TEST CƠ BẢN**

### ✅ 5.1 Test Node.js

```bash
# Test Node.js
node -e "console.log('Node.js hoạt động tốt!')"
```

### ✅ 5.2 Test Python3

```bash
# Test Python3
python3 -c "print('Python3 hoạt động tốt!')"
```

### ✅ 5.3 Test npm

```bash
# Test npm
npm --version
```

### ✅ 5.4 Test pip

```bash
# Test pip
pip --version
```

### ✅ 5.5 Test Google Sheets connection

```bash
# Test kết nối Google Sheets (tùy chọn)
cd main-project
node -e "
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('YOUR_SPREADSHEET_ID');
doc.useServiceAccountAuth(require('./backend/config/google-credentials.json'));
doc.loadInfo().then(() => {
  console.log('✅ Google Sheets kết nối thành công!');
  console.log('📋 Title:', doc.title);
}).catch(err => {
  console.log('❌ Lỗi kết nối Google Sheets:', err.message);
});
"
```

---

## 🚨 **XỬ LÝ LỖI THƯỜNG GẶP**

### ❌ **Lỗi: Node.js chưa cài đặt**

```bash
# Cài đặt Node.js trên macOS
brew install node

# Hoặc tải từ https://nodejs.org/
```

### ❌ **Lỗi: Python3 chưa cài đặt**

```bash
# Cài đặt Python3 trên macOS
brew install python3

# Hoặc tải từ https://python.org/
```

### ❌ **Lỗi: npm install failed**

```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json

# Cài đặt lại
npm install --legacy-peer-deps
```

### ❌ **Lỗi: pip install failed**

```bash
# Cập nhật pip
pip install --upgrade pip

# Cài đặt lại
pip install -r requirements.txt
```

### ❌ **Lỗi: Port đã được sử dụng**

```bash
# Tìm process đang sử dụng port
lsof -i :3000

# Dừng process
kill -9 <PID>
```

### ❌ **Lỗi: Google Sheets API không hoạt động**

```bash
# Kiểm tra API key
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID"

# Kiểm tra service account permissions
# Đảm bảo service account có quyền truy cập spreadsheet
```

### ❌ **Lỗi: Virtual environment không hoạt động**

```bash
# Tạo lại virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate

# Cài đặt lại packages
pip install -r requirements.txt
```

### ❌ **Lỗi: Dependencies conflict**

```bash
# Xóa cache npm
npm cache clean --force

# Xóa node_modules
rm -rf node_modules package-lock.json

# Cài đặt lại với legacy peer deps
npm install --legacy-peer-deps
```

---

## ✅ **CHECKLIST HOÀN THÀNH PHASE 1**

### 🔧 **Hệ thống**

- [ ] Node.js đã cài đặt và hoạt động
- [ ] Python3 đã cài đặt và hoạt động
- [ ] npm đã cài đặt và hoạt động
- [ ] pip đã cài đặt và hoạt động

### ☁️ **Google Cloud**

- [ ] Google Cloud Project đã tạo
- [ ] Google Sheets API đã enable
- [ ] Google Drive API đã enable
- [ ] Service Account đã tạo
- [ ] JSON key đã tải xuống
- [ ] Google Sheets permissions đã cấu hình

### 📦 **Dependencies**

- [ ] Main Project dependencies đã cài đặt
- [ ] Google Sheets Project dependencies đã cài đặt
- [ ] AI Service Python packages đã cài đặt
- [ ] Automation Python packages đã cài đặt

### ⚙️ **Cấu hình**

- [ ] Main Project config đã cập nhật
- [ ] Google Sheets Project config đã cập nhật
- [ ] Google credentials files đã có
- [ ] Ports đã kiểm tra và sẵn sàng

### 🧪 **Testing**

- [ ] Node.js test thành công
- [ ] Python3 test thành công
- [ ] npm test thành công
- [ ] pip test thành công
- [ ] Google Sheets connection test thành công (tùy chọn)

---

## 🎯 **BƯỚC TIẾP THEO**

Sau khi hoàn thành Phase 1, chuyển sang **Phase 2: Khởi động dịch vụ**

**Lưu ý**: Đảm bảo tất cả các bước trong Phase 1 đã hoàn thành trước khi chuyển sang Phase 2!
