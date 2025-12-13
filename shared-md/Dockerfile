# Multi-stage build for React OAS Integration Project

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-build

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Stage 3: Python automation
FROM python:3.9-alpine AS automation-build

WORKDIR /app/automation

# Install Python dependencies
COPY automation/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy automation source code
COPY automation/ ./

# Stage 4: Final production image
FROM node:18-alpine AS production

# Install Python for automation
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy built frontend
COPY --from=frontend-build /app/build ./frontend/build

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy automation
COPY --from=automation-build /app/automation ./automation

# Install global dependencies
RUN npm install -g concurrently pm2

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S react-oas -u 1001
USER react-oas

# Expose ports
EXPOSE 3000 3001 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start all services
CMD ["sh", "-c", "concurrently 'cd backend && npm start' 'cd automation && python3 src/main.py' 'npx serve -s frontend/build -l 3000'"]
