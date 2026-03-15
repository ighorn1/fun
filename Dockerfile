# ── Stage 1: Build React frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python backend + bundled frontend ───────────────────────────────
FROM python:3.12-slim

# System deps for pdfplumber (pdfminer)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy compiled React app into position expected by main.py
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 8000

# Uvicorn serves both the API (/api/*) and the React SPA (everything else)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
