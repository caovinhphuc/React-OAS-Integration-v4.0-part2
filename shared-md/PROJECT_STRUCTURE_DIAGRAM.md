# 📁 CẤU TRÚC DỰ ÁN REACT OAS INTEGRATION

## 🏗️ TỔNG QUAN DỰ ÁN

```
react-oas-integration-project/
├── 🎯 DỰ ÁN CHÍNH (AI-Powered Analytics Platform)
│   ├── Frontend (React) - Port 3000
│   ├── Backend (Node.js) - Port 3001
│   ├── AI Service (Python) - Port 8000
│   └── Automation (Python)
│
├── 📊 DỰ ÁN GOOGLE SHEETS (react-google-final)
│   ├── Frontend (React) - Port 3001 ⚠️ CONFLICT!
│   ├── Backend (Node.js) - Port 3001/3002 ⚠️ CONFLICT!
│   └── Google Sheets Integration
│
└── 🔧 CÁC DỊCH VỤ HỖ TRỢ
    ├── AI Service (Python/FastAPI)
    ├── Automation Service (Python)
    └── Google Apps Script (Deployed)
```

## ⚠️ VẤN ĐỀ CHÍNH: PORT CONFLICT

### 🔴 Xung đột Port 3001:

- **Dự án chính Backend**: `localhost:3001` (API Server)
- **react-google-final Frontend**: `localhost:3001` (React App)
- **react-google-final Backend**: `localhost:3001` (API Server)

## 🎯 CẤU TRÚC CHI TIẾT

### 1️⃣ DỰ ÁN CHÍNH (react-oas-integration-project)

```
📁 Frontend (React + TypeScript)
├── src/
│   ├── components/
│   │   ├── dashboard/ (Live Dashboard)
│   │   ├── ai/ (AI Analytics)
│   │   ├── common/ (Shared Components)
│   │   └── google/ (Google Sheets Integration)
│   ├── services/
│   │   ├── api/ (API Services)
│   │   ├── notifications/ (Alert System)
│   │   └── utils/ (Utilities)
│   ├── store/ (Redux Store)
│   ├── routes/ (React Router)
│   └── styles/ (Material-UI Themes)
│
📁 Backend (Node.js + Express)
├── src/
│   ├── routes/ (API Endpoints)
│   ├── models/ (Data Models)
│   ├── middleware/ (Auth, CORS, etc.)
│   └── server.js (Main Server)
│
📁 AI Service (Python + FastAPI)
├── models/
│   ├── predictor.py (Performance Prediction)
│   ├── anomaly_detector.py (Anomaly Detection)
│   └── optimizer.py (System Optimization)
├── utils/
│   └── data_processor.py (Data Processing)
└── main.py (FastAPI Server)
│
📁 Automation (Python)
├── src/
│   ├── modules/ (Google Sheets, Email, etc.)
│   ├── config/ (Configuration)
│   └── utils/ (Utilities)
└── run_automation.py (Scheduler)
```

### 2️⃣ DỰ ÁN GOOGLE SHEETS (react-google-final)

```
📁 Frontend (React)
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx (Authentication)
│   │   ├── Dashboard.tsx (Main Dashboard)
│   │   └── GoogleSheetsTest.tsx (Sheets Testing)
│   ├── components/
│   │   ├── GoogleSheetsTest.js (Sheets Integration)
│   │   ├── GoogleDriveTest.js (Drive Integration)
│   │   └── AlertTest.js (Alert System)
│   ├── services/
│   │   └── authService.js (Authentication)
│   └── App.js (Main App)
│
📁 Backend (Node.js)
├── server.js (Main Server)
├── routes/
│   ├── auth.js (Authentication)
│   ├── sheets.js (Google Sheets API)
│   ├── drive.js (Google Drive API)
│   └── alerts.js (Alert System)
└── config/
    └── google-credentials.json
```

## 🔄 LUỒNG DỮ LIỆU

### Dự án chính:

```
User → Frontend (3000) → Backend (3001) → AI Service (8000)
                    ↓
              Google Sheets API
                    ↓
              Automation Service
```

### react-google-final:

```
User → Frontend (3001) → Backend (3001/3002) → Google Sheets API
                    ↓
              Google Drive API
                    ↓
              Alert System
```

## 🎯 GIẢI PHÁP ĐỀ XUẤT

### Option 1: Tách riêng hoàn toàn

- Dự án chính: Port 3000, 3001, 8000
- react-google-final: Port 3002, 3003

### Option 2: Tích hợp vào dự án chính

- Merge react-google-final vào dự án chính
- Sử dụng chung Backend và Frontend

### Option 3: Microservices

- Mỗi service chạy trên port riêng
- Sử dụng Docker Compose để quản lý

## 📊 THỐNG KÊ DỰ ÁN

### Files và Directories:

- **Tổng files**: ~200+ files
- **Markdown files**: 8 core files (đã tổ chức)
- **Backup files**: 16 files (đã di chuyển)
- **Config files**: 15+ files
- **Test files**: 10+ files

### Technologies:

- **Frontend**: React 18, TypeScript, Material-UI v5
- **Backend**: Node.js, Express.js, Socket.io
- **AI/ML**: Python, FastAPI, scikit-learn
- **Database**: Google Sheets API
- **Deployment**: Docker, Vercel, Railway

### Services:

- **Authentication**: JWT, Google OAuth 2.0
- **Real-time**: WebSocket, Socket.io
- **AI/ML**: Predictive Analytics, Anomaly Detection
- **Automation**: Google Sheets Sync, Email Reports
- **Monitoring**: Health Checks, Performance Metrics
