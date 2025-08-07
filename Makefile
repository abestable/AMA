# WebApp Development Makefile
# Usage: make [target]

# Variables
BACKEND_PORT = 3001
FRONTEND_PORT = 3000
DATABASE_FILE = prisma/dev.db

# Colors for output
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Default target
.PHONY: help
help:
	@echo "$(BLUE)🔐 Secure WebApp Development Commands:$(NC)"
	@echo ""
	@echo "$(GREEN)Server Management:$(NC)"
	@echo "  make start      - Start both backend and frontend"
	@echo "  make stop       - Stop all servers"
	@echo "  make restart    - Restart all servers"
	@echo "  make status     - Check server status"
	@echo ""
	@echo "$(GREEN)Backend:$(NC)"
	@echo "  make backend    - Start backend only"
	@echo "  make backend-stop - Stop backend only"
	@echo ""
	@echo "$(GREEN)Frontend:$(NC)"
	@echo "  make frontend   - Start frontend only"
	@echo "  make frontend-stop - Stop frontend only"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  make db-reset   - Reset database and seed data"
	@echo "  make db-migrate - Run database migrations"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make install    - Install all dependencies"
	@echo "  make build      - Build for production"
	@echo "  make clean      - Clean all generated files"
	@echo "  make test       - Test backend health"

# Server Management
.PHONY: start
start:
	@echo "$(BLUE)🚀 Starting all servers...$(NC)"
	@make force-stop
	@sleep 2
	@make backend &
	@make frontend &
	@echo "$(GREEN)✅ All servers started!$(NC)"
	@echo "$(YELLOW)📱 Frontend: http://localhost:$(FRONTEND_PORT)$(NC)"
	@echo "$(YELLOW)🔧 Backend: http://localhost:$(BACKEND_PORT)$(NC)"
	@echo "$(YELLOW)📊 Health: http://localhost:$(BACKEND_PORT)/health$(NC)"

.PHONY: stop
stop:
	@echo "$(BLUE)🛑 Stopping all servers...$(NC)"
	@lsof -ti:$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true
	@lsof -ti:$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)✅ All servers stopped!$(NC)"

.PHONY: restart
restart:
	@echo "$(BLUE)🔄 Restarting all servers...$(NC)"
	@make stop
	@sleep 2
	@make start

.PHONY: status
status:
	@echo "$(BLUE)📊 Server Status:$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend ($(BACKEND_PORT)):$(NC)"
	@if curl -s http://localhost:$(BACKEND_PORT)/health >/dev/null 2>&1; then \
		echo "$(GREEN)  ✅ Running$(NC)"; \
	else \
		echo "$(RED)  ❌ Not running$(NC)"; \
	fi
	@echo ""
	@echo "$(YELLOW)Frontend ($(FRONTEND_PORT)):$(NC)"
	@if curl -s http://localhost:$(FRONTEND_PORT) >/dev/null 2>&1; then \
		echo "$(GREEN)  ✅ Running$(NC)"; \
	else \
		echo "$(RED)  ❌ Not running$(NC)"; \
	fi

# Backend Management
.PHONY: backend
backend:
	@echo "$(BLUE)🔧 Starting backend server...$(NC)"
	@cd $(PWD) && npx ts-node src/server.ts

.PHONY: backend-stop
backend-stop:
	@echo "$(BLUE)🛑 Stopping backend server...$(NC)"
	@lsof -ti:$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true

# Frontend Management
.PHONY: frontend
frontend:
	@echo "$(BLUE)📱 Starting frontend server...$(NC)"
	@cd client && npm start

.PHONY: frontend-stop
frontend-stop:
	@echo "$(BLUE)🛑 Stopping frontend server...$(NC)"
	@lsof -ti:$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || true

# Database Management
.PHONY: db-reset
db-reset:
	@echo "$(BLUE)🗄️  Resetting database...$(NC)"
	@rm -f $(DATABASE_FILE)
	@npx prisma migrate reset --force
	@npx prisma db push
	@npx ts-node src/database/seed.ts
	@echo "$(GREEN)✅ Database reset and seeded!$(NC)"

.PHONY: db-migrate
db-migrate:
	@echo "$(BLUE)🔄 Running database migrations...$(NC)"
	@npx prisma migrate dev
	@echo "$(GREEN)✅ Migrations completed!$(NC)"

# Development Tools
.PHONY: install
install:
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	@npm install
	@cd client && npm install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

.PHONY: test
test:
	@echo "$(BLUE)🧪 Running browser tests...$(NC)"
	@npx playwright test

.PHONY: test-ui
test-ui:
	@echo "$(BLUE)🧪 Running browser tests with UI...$(NC)"
	@npx playwright test --ui

.PHONY: test-report
test-report:
	@echo "$(BLUE)📊 Opening test report...$(NC)"
	@npx playwright show-report

.PHONY: test-install
test-install:
	@echo "$(BLUE)🔧 Installing Playwright browsers...$(NC)"
	@npx playwright install

.PHONY: build
build:
	@echo "$(BLUE)🏗️  Building for production...$(NC)"
	@cd client && npm run build
	@echo "$(GREEN)✅ Build completed!$(NC)"

.PHONY: clean
clean:
	@echo "$(BLUE)🧹 Cleaning generated files...$(NC)"
	@rm -rf node_modules
	@rm -rf client/node_modules
	@rm -rf client/build
	@rm -f $(DATABASE_FILE)
	@rm -f .env
	@echo "$(GREEN)✅ Clean completed!$(NC)"

.PHONY: health
health:
	@echo "$(BLUE)🧪 Testing backend health...$(NC)"
	@if curl -s http://localhost:$(BACKEND_PORT)/health >/dev/null 2>&1; then \
		echo "$(GREEN)✅ Backend is healthy!$(NC)"; \
		curl -s http://localhost:$(BACKEND_PORT)/health | jq . 2>/dev/null || curl -s http://localhost:$(BACKEND_PORT)/health; \
	else \
		echo "$(RED)❌ Backend is not responding$(NC)"; \
	fi

# Quick Commands
.PHONY: dev
dev: start

.PHONY: kill
kill: stop

.PHONY: reset
reset: stop db-reset start

# Show running processes
.PHONY: ps
ps:
	@echo "$(BLUE)🔍 Running processes:$(NC)"
	@ps aux | grep -E "(ts-node|react-scripts|node.*server)" | grep -v grep || echo "$(YELLOW)No development servers running$(NC)"

.PHONY: kill-ports
kill-ports:
	@echo "$(BLUE)🔫 Killing processes on ports $(FRONTEND_PORT) and $(BACKEND_PORT)...$(NC)"
	@lsof -ti:$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || true
	@lsof -ti:$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)✅ Ports cleared!$(NC)"

.PHONY: force-stop
force-stop: stop
