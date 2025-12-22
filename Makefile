.PHONY: help install dev dev-server dev-client build build-server build-client lint format test test-watch test-coverage db-migrate db-generate db-studio clean

# Default target
.DEFAULT_GOAL := help

# Colors for help output
CYAN := \033[36m
RESET := \033[0m

## help: Show this help message
help:
	@echo "FPH CRM - Available Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(CYAN)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## install: Install all dependencies
install: ## Install all dependencies
	npm install

## dev: Start both client and server in development mode
dev: ## Start development servers (client + server)
	npm run dev

## dev-server: Start only the backend server
dev-server: ## Start backend server only
	npm run dev:server

## dev-client: Start only the frontend client
dev-client: ## Start frontend client only
	npm run dev:client

## build: Build both client and server for production
build: ## Build for production
	npm run build

## build-server: Build only the backend server
build-server: ## Build backend only
	npm run build:server

## build-client: Build only the frontend client
build-client: ## Build frontend only
	npm run build:client

## lint: Run ESLint on client and server
lint: ## Run linting
	npm run lint

## format: Format code with Prettier
format: ## Format code with Prettier
	npm run format

## test: Run all tests
test: ## Run all tests
	cd server && npm test

## test-watch: Run tests in watch mode
test-watch: ## Run tests in watch mode
	cd server && npm run test:watch

## test-coverage: Run tests with coverage report
test-coverage: ## Run tests with coverage
	cd server && npm run test:coverage

## db-migrate: Run Prisma database migrations
db-migrate: ## Run database migrations
	npm run prisma:migrate

## db-generate: Generate Prisma client
db-generate: ## Generate Prisma client
	npm run prisma:generate

## db-studio: Open Prisma Studio (database GUI)
db-studio: ## Open Prisma Studio
	npm run prisma:studio

## clean: Remove build artifacts and node_modules
clean: ## Clean build artifacts
	rm -rf node_modules
	rm -rf client/node_modules client/dist
	rm -rf server/node_modules server/dist
	rm -rf shared/node_modules
