#!/bin/bash

# 🚀 START - Launcher đơn giản cho Warehouse Automation
# Chỉ cần click để chạy tất cả

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              🏭 WAREHOUSE AUTOMATION LAUNCHER               ║${NC}"
echo -e "${CYAN}║                     Click & Run System                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment chưa được tạo${NC}"
    echo -e "${YELLOW}🔧 Chạy setup trước...${NC}"
    ./setup.sh
fi

# Activate virtual environment
source venv/bin/activate

# Menu
while true; do
    echo -e "${BLUE}📋 CHỌN CHỨC NĂNG:${NC}"
    echo ""
    echo -e "${YELLOW}  1.${NC} ⚙️  Setup & Cài đặt hệ thống"
    echo -e "${YELLOW}  2.${NC} 🔧 Cấu hình nhanh credentials"
    echo -e "${YELLOW}  3.${NC} 🧪 Test hệ thống"
    echo -e "${YELLOW}  4.${NC} ⚡ Chạy automation nhanh (20-30s)"
    echo -e "${YELLOW}  5.${NC} 🚀 Chạy automation đầy đủ"
    echo -e "${YELLOW}  6.${NC} 📊 Chạy với SLA monitoring"
    echo -e "${YELLOW}  7.${NC} 📈 Xem kết quả data"
    echo -e "${YELLOW}  8.${NC} 🌐 Mở Dashboard Web"
    echo -e "${YELLOW}  9.${NC} 🔍 Kiểm tra system health"
    echo -e "${YELLOW}  0.${NC} 👋 Thoát"
    echo ""

    read -p "Chọn (0-9): " choice
    echo ""

    case $choice in
        1)
            echo -e "${BLUE}🔧 Chạy setup hệ thống...${NC}"
            ./setup.sh
            ;;
        2)
            echo -e "${BLUE}⚙️ Cấu hình credentials...${NC}"
            ./quick_config.sh
            ;;
        3)
            echo -e "${BLUE}🧪 Test hệ thống...${NC}"
            python quick_test.py
            ;;
        4)
            echo -e "${BLUE}⚡ Chạy automation nhanh...${NC}"
            ./quick_run.sh
            ;;
        5)
            echo -e "${BLUE}🚀 Chạy automation đầy đủ...${NC}"
            python automation.py
            ;;
        6)
            echo -e "${BLUE}📊 Chạy với SLA monitoring...${NC}"
            python automation_enhanced.py
            ;;
        7)
            echo -e "${BLUE}📈 Xem kết quả data...${NC}"
            if [ -f "data/orders_latest.csv" ]; then
                echo -e "${GREEN}📁 File data mới nhất:${NC}"
                ls -la data/orders_latest.csv
                echo ""
                echo -e "${GREEN}📊 Số dòng dữ liệu:${NC}"
                wc -l data/orders_latest.csv
                echo ""
                echo -e "${GREEN}🔍 Preview 5 dòng đầu:${NC}"
                head -5 data/orders_latest.csv
            else
                echo -e "${YELLOW}⚠️ Chưa có dữ liệu. Chạy automation trước.${NC}"
            fi
            ;;
        8)
            echo -e "${BLUE}🌐 Mở Dashboard Web...${NC}"
            ./start_dashboard.sh
            ;;
        9)
            echo -e "${BLUE}🔍 Kiểm tra system health...${NC}"
            python system_check.py
            ;;
        0)
            echo -e "${GREEN}👋 Tạm biệt!${NC}"
            break
            ;;
        *)
            echo -e "${RED}❌ Lựa chọn không hợp lệ!${NC}"
            ;;
    esac

    echo ""
    echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"
    echo ""
    read -p "Nhấn Enter để tiếp tục..."
    clear

    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              🏭 WAREHOUSE AUTOMATION LAUNCHER               ║${NC}"
    echo -e "${CYAN}║                     Click & Run System                      ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
done
