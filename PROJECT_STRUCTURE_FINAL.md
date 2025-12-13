# 📁 CẤU TRÚC DỰ ÁN CUỐI CÙNG

## 🎯 TỔNG QUAN DỰ ÁN

Dự án đã được cấu trúc lại thành 3 phần chính để tránh xung đột port và tổ chức rõ ràng:

```
react-oas-integration-project/
├── 🎯 main-project/           # Dự án chính (AI-Powered Analytics)
├── 📊 google-sheets-project/  # Dự án Google Sheets
├── 🔧 shared-services/        # Dịch vụ chung
└── 📚 Documentation/          # Tài liệu
```

## 🏗️ CẤU TRÚC CHI TIẾT

### 1️⃣ MAIN PROJECT (Dự án chính)

```
main-project/
├── src/                    # Frontend React (Port 3000)
│   ├── components/         # React Components
│   ├── services/          # API Services
│   ├── store/             # Redux Store
│   └── styles/            # Material-UI Themes
├── backend/               # Backend Node.js (Port 3001)
│   ├── src/
│   │   ├── routes/        # API Endpoints
│   │   ├── models/        # Data Models
│   │   └── middleware/    # Auth, CORS
│   └── server.js          # Main Server
├── ai-service/            # AI Service Python (Port 8000)
│   ├── models/            # ML Models
│   ├── utils/             # Data Processing
│   └── main.py            # FastAPI Server
├── automation/            # Automation Service Python
│   ├── src/               # Automation Modules
│   └── run_automation.py  # Scheduler
├── package.json           # Dependencies
├── start.sh              # Auto Start Script
└── README.md             # Documentation
```

### 2️⃣ GOOGLE SHEETS PROJECT

```
google-sheets-project/
├── src/                   # Frontend React (Port 3002)
│   ├── pages/            # Login, Dashboard, Test
│   ├── components/       # Google Sheets Components
│   └── services/         # Authentication Service
├── server.js             # Backend Node.js (Port 3003)
├── package.json          # Dependencies
├── start.sh             # Auto Start Script
└── README.md            # Documentation
```

### 3️⃣ SHARED SERVICES

```
shared-services/
├── google-apps-script/   # Google Apps Script
├── service/              # Common Services
└── shared/               # Shared Resources
```

## 🔄 LUỒNG DỮ LIỆU

### Main Project

```
User → Frontend (3000) → Backend (3001) → AI Service (8000)
                    ↓
              Google Sheets API
                    ↓
              Automation Service
```

### Google Sheets Project

```
User → Frontend (3002) → Backend (3003) → Google Sheets API
                    ↓
              Google Drive API
                    ↓
              Alert System
```

## 🚀 CÁCH KHỞI ĐỘNG

### Khởi động dự án chính

```bash
cd main-project
./start.sh
```

### Khởi động dự án Google Sheets

```bash
cd google-sheets-project
./start.sh
```

### Khởi động cả hai dự án

```bash
# Terminal 1
cd main-project && ./start.sh

# Terminal 2
cd google-sheets-project && ./start.sh
```

## 🌐 PORTS

| Service                | Port | URL                     |
| ---------------------- | ---- | ----------------------- |
| Main Frontend          | 3000 | <http://localhost:3000> |
| Main Backend           | 3001 | <http://localhost:3001> |
| Google Sheets Frontend | 3002 | <http://localhost:3002> |
| Google Sheets Backend  | 3003 | <http://localhost:3003> |
| AI Service             | 8000 | <http://localhost:8000> |

## ✅ LỢI ÍCH CỦA CẤU TRÚC MỚI

1. **Tránh xung đột port**: Mỗi dự án có port riêng
2. **Tổ chức rõ ràng**: Dễ tìm và quản lý
3. **Khởi động độc lập**: Có thể chạy riêng từng dự án
4. **Dễ bảo trì**: Cấu trúc logic và dễ hiểu
5. **Mở rộng dễ dàng**: Thêm dự án mới không ảnh hưởng

## 🔧 TÍNH NĂNG CHÍNH

### Main Project

- ✅ AI/ML Analytics
- ✅ Real-time Dashboard
- ✅ WebSocket Communication
- ✅ Google Sheets Integration
- ✅ Automation Service

### Google Sheets Project

- ✅ Google Sheets Authentication
- ✅ Data Read/Write
- ✅ Google Drive Integration
- ✅ Alert System
- ✅ Real-time Sync

## 📊 TECHNOLOGIES

- **Frontend**: React 18, Material-UI v5, Redux Toolkit
- **Backend**: Node.js, Express.js, Socket.io
- **AI/ML**: Python, FastAPI, scikit-learn
- **Database**: Google Sheets API
- **Deployment**: Docker, Vercel, Railway
