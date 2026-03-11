# 1. Root (React app + backend qua workspace)

pnpm start

# 2. AI Service

cd ai-service && source venv/bin/activate
python -m uvicorn main_simple:app --host 0.0.0.0 --port 8000 --reload

# 3. Google integration frontend (nếu cần)

cd react-oas-integration/frontend && npm start

# Lần sau khi setup lại AI Service, dùng

cd ai-service && ./setup_venv.sh
