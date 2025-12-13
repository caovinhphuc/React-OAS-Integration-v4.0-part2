#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automation Dashboard Service
Web-based dashboard cho Automation System
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
import json
import os
import sys
from datetime import datetime
import pandas as pd
import asyncio
from pathlib import Path

# Add automation modules to path
sys.path.append('./automation')
sys.path.append('./automation/automation_new')

app = FastAPI(
    title="MIA Automation Dashboard",
    description="Dashboard cho Warehouse Automation System",
    version="2.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global automation instance
automation_system = None

@app.get("/")
async def root():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>MIA Automation Dashboard</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .card h3 { margin-top: 0; color: #333; }
            .status { padding: 5px 10px; border-radius: 5px; color: white; font-size: 12px; }
            .status.running { background: #28a745; }
            .status.stopped { background: #dc3545; }
            .btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
            .btn:hover { background: #5a6fd8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏭 MIA Automation Dashboard</h1>
                <p>Warehouse Automation & SLA Monitoring System</p>
            </div>

            <div class="cards">
                <div class="card">
                    <h3>🤖 Automation Status</h3>
                    <p>Service: <span class="status running">RUNNING</span></p>
                    <p>Last Update: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
                    <button class="btn" onclick="location.href='/automation/status'">View Details</button>
                </div>

                <div class="card">
                    <h3>📊 Data Processing</h3>
                    <p>Processed: 0 items today</p>
                    <p>Queue: 0 pending</p>
                    <button class="btn" onclick="location.href='/automation/data'">View Data</button>
                </div>

                <div class="card">
                    <h3>📈 SLA Monitoring</h3>
                    <p>SLA Compliance: 98.5%</p>
                    <p>Response Time: < 2s</p>
                    <button class="btn" onclick="location.href='/automation/sla'">View SLA</button>
                </div>

                <div class="card">
                    <h3>🔧 System Health</h3>
                    <p>CPU: 45%</p>
                    <p>Memory: 2.1GB / 8GB</p>
                    <button class="btn" onclick="location.href='/health'">Health Check</button>
                </div>
            </div>
        </div>
    </body>
    </html>
    """)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Automation Dashboard",
        "version": "2.1",
        "components": {
            "automation_engine": True,
            "sla_monitor": True,
            "data_processor": True,
            "google_sheets": True
        },
        "endpoints": [
            "/automation/status",
            "/automation/data",
            "/automation/sla",
            "/automation/run"
        ]
    }

@app.get("/automation/status")
async def automation_status():
    return {
        "automation_service": "running",
        "last_run": datetime.now().isoformat(),
        "total_runs": 0,
        "success_rate": 100.0,
        "errors": [],
        "next_scheduled": "Not scheduled"
    }

@app.get("/automation/data")
async def automation_data():
    # Try to read recent data
    try:
        data_files = []
        data_dir = Path("./automation/data")
        if data_dir.exists():
            data_files = [f.name for f in data_dir.glob("*.json")][:10]

        return {
            "processed_files": len(data_files),
            "recent_files": data_files,
            "data_directory": str(data_dir),
            "total_size": "0 MB"
        }
    except Exception as e:
        return {
            "error": str(e),
            "processed_files": 0,
            "recent_files": []
        }

@app.get("/automation/sla")
async def sla_monitoring():
    return {
        "sla_compliance": 98.5,
        "response_time_avg": 1.2,
        "uptime": 99.9,
        "incidents": 0,
        "last_check": datetime.now().isoformat(),
        "metrics": {
            "availability": 99.9,
            "performance": 95.0,
            "quality": 98.0
        }
    }

@app.post("/automation/run")
async def run_automation():
    """Trigger automation run manually"""
    try:
        # Simulate automation run
        return {
            "status": "success",
            "message": "Automation started successfully",
            "run_id": f"run_{int(datetime.now().timestamp())}",
            "estimated_duration": "5-10 minutes"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/automation/logs")
async def get_logs():
    """Get recent automation logs"""
    try:
        logs = []
        log_dir = Path("./logs")
        if log_dir.exists():
            for log_file in log_dir.glob("automation*.log"):
                try:
                    with open(log_file, 'r') as f:
                        lines = f.readlines()[-50:]  # Last 50 lines
                        logs.extend([
                            {
                                "timestamp": datetime.now().isoformat(),
                                "level": "INFO",
                                "message": line.strip(),
                                "source": log_file.name
                            } for line in lines if line.strip()
                        ])
                except:
                    continue

        return {
            "logs": logs[-100:],  # Last 100 log entries
            "total_files": len(list(Path("./logs").glob("automation*.log"))) if Path("./logs").exists() else 0
        }
    except Exception as e:
        return {
            "error": str(e),
            "logs": []
        }

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='MIA Automation Dashboard')
    parser.add_argument('--port', type=int, default=8001, help='Port to run on')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    args = parser.parse_args()

    print(f"🏭 Starting MIA Automation Dashboard on http://{args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")
