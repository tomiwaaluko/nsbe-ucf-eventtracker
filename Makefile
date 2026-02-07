.PHONY: help install install-backend install-frontend clean dev dev-backend dev-frontend build build-backend build-frontend test lint format prisma-generate prisma-migrate prisma-studio prisma-seed docker-up docker-down docker-build docker-restart docker-logs docker-db-up docker-db-down docker-clean docker-dev

help:
	@echo "NSBE UCF Event Tracker - Available Commands:"
	@echo ""
	@echo "Docker Commands (Recommended):"
	@echo "  make docker-up        - Start all services with Docker Compose"
	@echo "  make docker-down      - Stop all Docker services"
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-restart   - Restart all Docker services"
	@echo "  make docker-logs      - View logs from all services"
	@echo "  make docker-clean     - Stop and remove all containers, volumes, and images"
	@echo "  make docker-dev       - Run services in development mode with Docker"
	@echo "  make docker-db-up     - Start only the database container"
	@echo "  make docker-db-down   - Stop the database container"
	@echo ""
	@echo "Local Development Commands:"
	@echo "  make install          - Install all dependencies (backend + frontend)"
	@echo "  make dev              - Run both backend and frontend in development mode"
	@echo "  make build            - Build both backend and frontend for production"
	@echo "  make test             - Run all tests"
	@echo "  make lint             - Run linters on both projects"
	@echo "  make format           - Format code in both projects"
	@echo "  make clean            - Remove node_modules and build artifacts"
	@echo ""
	@echo "Backend Commands:"
	@echo "  make install-backend  - Install backend dependencies"
	@echo "  make dev-backend      - Run backend in development mode"
	@echo "  make build-backend    - Build backend for production"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  make install-frontend - Install frontend dependencies"
	@echo "  make dev-frontend     - Run frontend in development mode"
	@echo "  make build-frontend   - Build frontend for production"
	@echo ""
	@echo "Database Commands:"
	@echo "  make prisma-generate  - Generate Prisma client"
	@echo "  make prisma-migrate   - Run Prisma migrations"
	@echo "  make prisma-studio    - Open Prisma Studio"
	@echo "  make prisma-seed      - Seed the database"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-up        - Start all Docker containers (postgres + backend)"
	@echo "  make docker-down      - Stop all Docker containers"
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-logs      - View Docker container logs"
	@echo "  make docker-restart   - Restart Docker containers"
	@echo "  make docker-ps        - List running Docker containers"
	@echo "  make docker-clean     - Stop containers and remove volumes"

# ============================================================================
# Docker Commands
# ============================================================================

docker-up:
	@echo "Starting all services with Docker Compose..."
	cd backend && docker-compose up -d
	@echo ""
	@echo "✅ Services started!"
	@echo "Backend API: http://localhost:4000"
	@echo "Database: localhost:5432"
	@echo ""
	@echo "View logs with: make docker-logs"

docker-down:
	@echo "Stopping all Docker services..."
	cd backend && docker-compose down
	@echo "✅ Services stopped!"

docker-build:
	@echo "Building Docker images..."
	cd backend && docker-compose build --no-cache
	@echo "✅ Docker images built successfully!"

docker-restart:
	@echo "Restarting all Docker services..."
	cd backend && docker-compose restart
	@echo "✅ Services restarted!"

docker-logs:
	@echo "Viewing logs (press Ctrl+C to exit)..."
	cd backend && docker-compose logs -f

docker-logs-backend:
	@echo "Viewing backend logs (press Ctrl+C to exit)..."
	cd backend && docker-compose logs -f backend

docker-logs-db:
	@echo "Viewing database logs (press Ctrl+C to exit)..."
	cd backend && docker-compose logs -f postgres

docker-clean:
	@echo "⚠️  WARNING: This will remove all containers, volumes, and images!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read -r
	@echo "Stopping and removing all containers..."
	cd backend && docker-compose down -v
	@echo "Removing Docker images..."
	docker rmi nsbe-backend postgres:15-alpine 2>/dev/null || true
	@echo "✅ Docker cleanup complete!"

docker-dev:
	@echo "Starting services in development mode..."
	@echo "This will start the database and allow you to run backend locally"
	cd backend && docker-compose up -d postgres
	@echo ""
	@echo "✅ Database started!"
	@echo "Now run: make dev-backend (in another terminal)"
	@echo "Then run: make dev-frontend (in another terminal)"

docker-db-up:
	@echo "Starting PostgreSQL database..."
	cd backend && docker-compose up -d postgres
	@echo "✅ Database started on localhost:5432"
	@echo "Connection string: postgresql://nsbe_user:nsbe_password@localhost:5432/nsbe_eventtracker"

docker-db-down:
	@echo "Stopping PostgreSQL database..."
	cd backend && docker-compose stop postgres
	@echo "✅ Database stopped!"

# ============================================================================
# Local Development Commands
# ============================================================================

install: install-backend install-frontend
	@echo "✅ All dependencies installed successfully!"

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && npm install

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

clean:
	@echo "Cleaning build artifacts and dependencies..."
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/.next frontend/out
	@echo "✅ Clean complete!"

dev:
	@echo "Starting backend and frontend in development mode..."
	@echo "Backend will run on http://localhost:4000"
	@echo "Frontend will run on http://localhost:3000"
	@echo ""
	@echo "Make sure your backend/.env is configured!"
	@make -j2 dev-backend dev-frontend

dev-backend:
	@echo "Starting backend in development mode..."
	cd backend && npm run start:dev

dev-frontend:
	@echo "Starting frontend in development mode..."
	cd frontend && npm run dev

build: build-backend build-frontend
	@echo "✅ Build complete!"

build-backend:
	@echo "Building backend..."
	cd backend && npm run build

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

test:
	@echo "Running backend tests..."
	cd backend && npm test

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test

lint:
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint || echo "Frontend lint not configured"

format:
	@echo "Formatting backend code..."
	cd backend && npm run format
	@echo "Formatting frontend code..."
	cd frontend && npm run format || echo "Frontend format not configured"

# ============================================================================
# Database Commands
# ============================================================================

prisma-generate:
	@echo "Generating Prisma client..."
	cd backend && npx prisma generate
	@echo "✅ Prisma client generated!"

prisma-migrate:
	@echo "Running Prisma migrations..."
	cd backend && npx prisma migrate dev
	@echo "✅ Migrations applied!"

prisma-migrate-prod:
	@echo "Running Prisma migrations in production..."
	cd backend && npx prisma migrate deploy
	@echo "✅ Production migrations applied!"

prisma-studio:
	@echo "Opening Prisma Studio..."
	cd backend && npx prisma studio

prisma-seed:
	@echo "Seeding database..."
	cd backend && npx prisma db seed
	@echo "✅ Database seeded!"

prisma-reset:
	@echo "⚠️  WARNING: This will reset your database and lose all data!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read -r
	@echo "Resetting database..."
	cd backend && npx prisma migrate reset
	@echo "✅ Database reset complete!"

# ============================================================================
# Utility Commands
# ============================================================================

check-env:
	@echo "Checking environment configuration..."
	@if [ ! -f backend/.env ]; then \
		echo "❌ backend/.env not found!"; \
		echo "Copy backend/.env.example to backend/.env and configure it"; \
		exit 1; \
	fi
	@if [ ! -f frontend/.env ]; then \
		echo "⚠️  frontend/.env not found (optional)"; \
	fi
	@echo "✅ Environment files found!"

setup: check-env install prisma-generate
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Configure your backend/.env file with database credentials"
	@echo "2. Run 'make docker-db-up' to start the database"
	@echo "3. Run 'make prisma-migrate' to set up the database schema"
	@echo "4. Run 'make dev' to start development servers"
	@echo ""
	@echo "Or use Docker for everything: make docker-up"

docker-setup: check-env
	@echo "Setting up with Docker..."
	cd backend && docker-compose build
	cd backend && docker-compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 5
	cd backend && docker-compose run --rm backend npx prisma migrate deploy
	@echo ""
	@echo "✅ Docker setup complete!"
	@echo "Run 'make docker-up' to start all services"

# ============================================================================
# Quick Start Commands
# ============================================================================

start: docker-up
	@echo "Application started with Docker!"

stop: docker-down
	@echo "Application stopped!"

restart: docker-restart
	@echo "Application restarted!"

logs: docker-logs
	@echo "Showing application logs..."

# ============================================================================
# Info Commands
# ============================================================================

status:
	@echo "Docker Services Status:"
	@cd backend && docker-compose ps

info:
	@echo "NSBE UCF Event Tracker"
	@echo "======================"
	@echo ""
	@echo "Services:"
	@echo "  Backend:  http://localhost:4000"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Database: localhost:5432"
	@echo ""
	@echo "Documentation:"
	@echo "  Design:   QR_CODE_SYSTEM_DESIGN.md"
	@echo "  Backend:  backend/README.md"
	@echo ""
	@echo "Run 'make help' for all available commands"
