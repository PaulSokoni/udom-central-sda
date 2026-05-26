#!/bin/bash
# Start UDOM Central SDA Church Management System

echo "Starting UDOM Central SDA Church Management System..."
echo ""

# Start Django backend
echo "[1/2] Starting Django API backend on http://localhost:8002 ..."
ROOT="$(dirname "$0")"
cd "$ROOT/backend"
python3 manage.py runserver 8002 &
DJANGO_PID=$!

# Wait a moment then start frontend dev server
sleep 2
echo "[2/2] Starting React frontend on http://localhost:5175 ..."
cd "$ROOT/frontend" && npm run dev &
REACT_PID=$!

echo ""
echo "==========================================="
echo "  UDOM Central SDA Church System Running"
echo "==========================================="
echo "  Frontend:  http://localhost:5175"
echo "  Backend:   http://localhost:8002"
echo "  Admin:     http://localhost:8002/admin/"
echo ""
echo "  Default login: admin / admin123"
echo "==========================================="
echo "  Press Ctrl+C to stop all services"
echo ""

trap "kill $DJANGO_PID $REACT_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
