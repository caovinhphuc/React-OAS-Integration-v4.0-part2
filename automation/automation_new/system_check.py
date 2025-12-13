#!/usr/bin/env python3
"""
System Check - Kiểm tra toàn bộ hệ thống warehouse automation
"""

import os
import sys
import json


def check_dependencies():
    """Kiểm tra dependencies"""
    print("🔍 1. KIỂM TRA DEPENDENCIES")
    print("-" * 40)

    required_packages = [
        'selenium', 'webdriver_manager', 'schedule', 'pandas',
        'openpyxl', 'dotenv', 'requests', 'matplotlib', 'seaborn',
        'numpy', 'xlsxwriter', 'bs4', 'lxml', 'streamlit',
        'plotly', 'flask', 'flask_cors', 'flask_compress'
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - THIẾU")
            missing.append(package)

    if missing:
        print(f"\n💡 Cài đặt: pip install {' '.join(missing)}")
        return False
    else:
        print(f"\n🎉 Tất cả {len(required_packages)} packages OK!")
        return True


def main():
    """Chạy tất cả kiểm tra"""
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                    🔧 SYSTEM HEALTH CHECK                    ║")
    print("║              Warehouse Automation System v2.0               ║")
    print("╚══════════════════════════════════════════════════════════════╝\n")

    deps_ok = check_dependencies()

    if deps_ok:
        print("\n🎉 HỆ THỐNG SẴN SÀNG!")
        print("💡 Chạy: python automation.py")
        return True
    else:
        print("\n⚠️ HỆ THỐNG CHƯA SẴN SÀNG")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
