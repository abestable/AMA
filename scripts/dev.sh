#!/bin/bash

# WebApp Development Script
# Usage: ./scripts/dev.sh [command]

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_PORT=3001
FRONTEND_PORT=3000
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Functions
show_help() {
    echo -e "${BLUE}🔐 Secure WebApp Development Script${NC}"
    echo ""
    echo -e "${GREEN}Server Management:${NC}"
    echo "  start     - Start both backend and frontend"
    echo "  stop      - Stop all servers"
    echo "  restart   - Restart all servers"
    echo "  status    - Check server status"
    echo ""
    echo -e "${GREEN}Individual Servers:${NC}"
    echo "  backend   - Start backend only"
    echo "  frontend  - Start frontend only"
    echo "  kill      - Force kill all processes"
    echo ""
    echo -e "${GREEN}Database:${NC}"
    echo "  db-reset  - Reset database and seed data"
    echo ""
    echo -e "${GREEN}Development:${NC}"
    echo "  install   - Install all dependencies"
    echo "  build     - Build for production"
    echo "  clean     - Clean all generated files"
    echo "  test      - Test backend health"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./scripts/dev.sh start"
    echo "  ./scripts/dev.sh stop"
    echo "  ./scripts/dev.sh status"
}

stop_servers() {
    echo -e "${BLUE}🛑 Stopping all servers...${NC}"
    pkill -f "ts-node" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "npm.*start" 2>/dev/null || true
    echo -e "${GREEN}✅ All servers stopped!${NC}"
}

start_backend() {
    echo -e "${BLUE}🔧 Starting backend server...${NC}"
    cd "$PROJECT_ROOT"
    npx ts-node src/server.ts &
    sleep 3
}

start_frontend() {
    echo -e "${BLUE}📱 Starting frontend server...${NC}"
    cd "$PROJECT_ROOT/client"
    npm start &
    sleep 5
}

check_status() {
    echo -e "${BLUE}📊 Server Status:${NC}"
    echo ""
    
    echo -e "${YELLOW}Backend ($BACKEND_PORT):${NC}"
    if curl -s "http://localhost:$BACKEND_PORT/health" >/dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Running${NC}"
    else
        echo -e "${RED}  ❌ Not running${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Frontend ($FRONTEND_PORT):${NC}"
    if curl -s "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Running${NC}"
    else
        echo -e "${RED}  ❌ Not running${NC}"
    fi
}

# Main script logic
case "${1:-help}" in
    "start")
        stop_servers
        start_backend
        start_frontend
        echo -e "${GREEN}✅ All servers started!${NC}"
        echo -e "${YELLOW}📱 Frontend: http://localhost:$FRONTEND_PORT${NC}"
        echo -e "${YELLOW}🔧 Backend: http://localhost:$BACKEND_PORT${NC}"
        echo -e "${YELLOW}📊 Health: http://localhost:$BACKEND_PORT/health${NC}"
        ;;
    "stop")
        stop_servers
        ;;
    "restart")
        stop_servers
        sleep 2
        $0 start
        ;;
    "status")
        check_status
        ;;
    "backend")
        stop_servers
        start_backend
        echo -e "${GREEN}✅ Backend started!${NC}"
        ;;
    "frontend")
        stop_servers
        start_frontend
        echo -e "${GREEN}✅ Frontend started!${NC}"
        ;;
    "kill")
        echo -e "${RED}💀 Force killing all processes...${NC}"
        pkill -9 -f "ts-node" 2>/dev/null || true
        pkill -9 -f "react-scripts" 2>/dev/null || true
        pkill -9 -f "node" 2>/dev/null || true
        echo -e "${GREEN}✅ All processes killed!${NC}"
        ;;
    "db-reset")
        echo -e "${BLUE}🗄️  Resetting database...${NC}"
        cd "$PROJECT_ROOT"
        rm -f prisma/dev.db
        npx prisma migrate reset --force
        npx prisma db push
        npx ts-node src/database/seed.ts
        echo -e "${GREEN}✅ Database reset and seeded!${NC}"
        ;;
    "install")
        echo -e "${BLUE}📦 Installing dependencies...${NC}"
        cd "$PROJECT_ROOT"
        npm install
        cd client && npm install
        echo -e "${GREEN}✅ Dependencies installed!${NC}"
        ;;
    "build")
        echo -e "${BLUE}🏗️  Building for production...${NC}"
        cd "$PROJECT_ROOT/client"
        npm run build
        echo -e "${GREEN}✅ Build completed!${NC}"
        ;;
    "clean")
        echo -e "${BLUE}🧹 Cleaning generated files...${NC}"
        cd "$PROJECT_ROOT"
        rm -rf node_modules
        rm -rf client/node_modules
        rm -rf client/build
        rm -f prisma/dev.db
        rm -f .env
        echo -e "${GREEN}✅ Clean completed!${NC}"
        ;;
    "test")
        echo -e "${BLUE}🧪 Testing backend health...${NC}"
        if curl -s "http://localhost:$BACKEND_PORT/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is healthy!${NC}"
            curl -s "http://localhost:$BACKEND_PORT/health"
        else
            echo -e "${RED}❌ Backend is not responding${NC}"
        fi
        ;;
    "help"|*)
        show_help
        ;;
esac

