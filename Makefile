.PHONY: help install install-backend install-frontend clean dev dev-backend dev-frontend build build-backend build-frontend test lint format prisma-generate prisma-migrate prisma-studio prisma-seed docker-up docker-down docker-build docker-logs docker-restart docker-ps docker-clean

help:
	@echo "NSBE UCF Event Tracker - Available Commands:"
	@echo ""
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

install: install-backend install-frontend
	@echo "All dependencies installed successfully!"

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && npm install

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

clean:
	@echo "Cleaning build artifacts and dependencies..."
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/dist
	@echo "Clean complete!"

dev:
	@echo "Starting backend and frontend in development mode..."
	@echo "Backend will run on default NestJS port (usually 3000)"
	@echo "Frontend will run on default Vite port (usually 5173)"
	@make -j2 dev-backend dev-frontend

dev-backend:
	@echo "Starting backend..."
	cd backend && npm run start:dev

dev-frontend:
	@echo "Starting frontend..."
	cd frontend && npm run dev

build: build-backend build-frontend
	@echo "Build complete!"

build-backend:
	@echo "Building backend..."
	cd backend && npm run build

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

test:
	@echo "Running backend tests..."
	cd backend && npm test

lint:
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint

format:
	@echo "Formatting backend code..."
	cd backend && npm run format

prisma-generate:
	@echo "Generating Prisma client..."
	cd backend && npx prisma generate

prisma-migrate:
	@echo "Running Prisma migrations..."
	cd backend && npx prisma migrate dev

prisma-studio:
	@echo "Opening Prisma Studio..."
	cd backend && npx prisma studio

prisma-seed:
	@echo "Seeding database..."
	cd backend && npx prisma db seed

docker-up:
	@echo "Starting Docker containers..."
	cd backend && docker-compose up -d
	@echo "Containers started! Backend: http://localhost:4000"

docker-down:
	@echo "Stopping Docker containers..."
	cd backend && docker-compose down

docker-build:
	@echo "Building Docker images..."
	cd backend && docker-compose build

docker-logs:
	@echo "Showing Docker logs (Ctrl+C to exit)..."
	cd backend && docker-compose logs -f

docker-restart:
	@echo "Restarting Docker containers..."
	cd backend && docker-compose restart

docker-ps:
	@echo "Listing Docker containers..."
	cd backend && docker-compose ps

docker-clean:
	@echo "Stopping containers and removing volumes..."
	cd backend && docker-compose down -v
	@echo "Docker cleanup complete!"
