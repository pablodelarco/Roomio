# StayWell Manager - Development & Deployment Makefile

# Variables
DOCKER_IMAGE = ghcr.io/pablodelarco/staywell-manager
VERSION ?= latest
NAMESPACE_DEV = staywell-manager-dev
NAMESPACE_PROD = staywell-manager

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m # No Color

.PHONY: help install build test lint docker-build docker-run k8s-dev k8s-prod clean

help: ## Show this help message
	@echo "StayWell Manager - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	npm ci

build: ## Build the application
	@echo "$(GREEN)Building application...$(NC)"
	npm run build:prod

test: ## Run tests and linting
	@echo "$(GREEN)Running tests and linting...$(NC)"
	npm run lint
	npm run type-check
	npm test

lint-fix: ## Fix linting issues
	@echo "$(GREEN)Fixing linting issues...$(NC)"
	npm run lint:fix

# Docker Commands
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build -t $(DOCKER_IMAGE):$(VERSION) .

docker-run: ## Run Docker container locally
	@echo "$(GREEN)Running Docker container...$(NC)"
	docker run -p 8080:8080 $(DOCKER_IMAGE):$(VERSION)

docker-compose-up: ## Start local environment with Docker Compose
	@echo "$(GREEN)Starting local environment...$(NC)"
	docker-compose up --build

docker-compose-down: ## Stop local environment
	@echo "$(YELLOW)Stopping local environment...$(NC)"
	docker-compose down

docker-push: docker-build ## Build and push Docker image
	@echo "$(GREEN)Pushing Docker image...$(NC)"
	docker push $(DOCKER_IMAGE):$(VERSION)

# Kubernetes Commands
k8s-dev-deploy: ## Deploy to development environment
	@echo "$(GREEN)Deploying to development...$(NC)"
	kubectl apply -k k8s/overlays/development

k8s-prod-deploy: ## Deploy to production environment
	@echo "$(YELLOW)Deploying to production...$(NC)"
	kubectl apply -k k8s/overlays/production

k8s-dev-status: ## Check development deployment status
	@echo "$(GREEN)Development environment status:$(NC)"
	kubectl get all -n $(NAMESPACE_DEV)

k8s-prod-status: ## Check production deployment status
	@echo "$(GREEN)Production environment status:$(NC)"
	kubectl get all -n $(NAMESPACE_PROD)

k8s-dev-logs: ## View development logs
	kubectl logs -f deployment/dev-staywell-frontend -n $(NAMESPACE_DEV)

k8s-prod-logs: ## View production logs
	kubectl logs -f deployment/prod-staywell-frontend -n $(NAMESPACE_PROD)

k8s-dev-delete: ## Delete development deployment
	@echo "$(RED)Deleting development deployment...$(NC)"
	kubectl delete -k k8s/overlays/development

k8s-prod-delete: ## Delete production deployment
	@echo "$(RED)Deleting production deployment...$(NC)"
	kubectl delete -k k8s/overlays/production

# ArgoCD Commands
argocd-install: ## Install ArgoCD
	@echo "$(GREEN)Installing ArgoCD...$(NC)"
	kubectl create namespace argocd
	kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

argocd-apps: ## Deploy ArgoCD applications
	@echo "$(GREEN)Deploying ArgoCD applications...$(NC)"
	kubectl apply -f argocd/applications/

argocd-password: ## Get ArgoCD admin password
	@echo "$(GREEN)ArgoCD admin password:$(NC)"
	kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo

# Utility Commands
clean: ## Clean up build artifacts
	@echo "$(YELLOW)Cleaning up...$(NC)"
	rm -rf dist node_modules/.cache
	docker system prune -f

validate-k8s: ## Validate Kubernetes manifests
	@echo "$(GREEN)Validating Kubernetes manifests...$(NC)"
	kubectl apply --dry-run=client -k k8s/overlays/development
	kubectl apply --dry-run=client -k k8s/overlays/production

port-forward-dev: ## Port forward development service
	@echo "$(GREEN)Port forwarding development service to localhost:8080...$(NC)"
	kubectl port-forward svc/dev-staywell-frontend-service 8080:80 -n $(NAMESPACE_DEV)

port-forward-prod: ## Port forward production service
	@echo "$(GREEN)Port forwarding production service to localhost:8080...$(NC)"
	kubectl port-forward svc/prod-staywell-frontend-service 8080:80 -n $(NAMESPACE_PROD)
