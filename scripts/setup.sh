#!/bin/bash

# StayWell Manager - Setup Script
# This script sets up the development environment and validates the deployment configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if command -v $1 &> /dev/null; then
        log_success "$1 is installed"
        return 0
    else
        log_error "$1 is not installed"
        return 1
    fi
}

# Main setup function
main() {
    log_info "Setting up StayWell Manager development environment..."
    
    # Check prerequisites
    log_info "Checking prerequisites..."
    
    MISSING_TOOLS=0
    
    if ! check_command "node"; then
        log_error "Please install Node.js (v18 or later)"
        MISSING_TOOLS=1
    fi
    
    if ! check_command "npm"; then
        log_error "Please install npm"
        MISSING_TOOLS=1
    fi
    
    if ! check_command "docker"; then
        log_warning "Docker not found - Docker commands will not work"
    fi
    
    if ! check_command "kubectl"; then
        log_warning "kubectl not found - Kubernetes commands will not work"
    fi
    
    if [ $MISSING_TOOLS -eq 1 ]; then
        log_error "Please install missing tools before continuing"
        exit 1
    fi
    
    # Install dependencies
    log_info "Installing Node.js dependencies..."
    npm ci
    
    # Create environment file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        log_info "Creating .env.local from template..."
        cp .env.example .env.local
        log_warning "Please update .env.local with your actual Supabase credentials"
    fi
    
    # Validate build
    log_info "Validating build..."
    npm run build:prod
    
    # Validate Docker build if Docker is available
    if command -v docker &> /dev/null; then
        log_info "Validating Docker build..."
        docker build -t staywell-manager:test .
        log_success "Docker build successful"
    fi
    
    # Validate Kubernetes manifests if kubectl is available
    if command -v kubectl &> /dev/null; then
        log_info "Validating Kubernetes manifests..."
        kubectl apply --dry-run=client -k k8s/overlays/development > /dev/null
        kubectl apply --dry-run=client -k k8s/overlays/production > /dev/null
        log_success "Kubernetes manifests are valid"
    fi
    
    log_success "Setup completed successfully!"
    echo ""
    log_info "Next steps:"
    echo "1. Update .env.local with your Supabase credentials"
    echo "2. Run 'npm run dev' for local development"
    echo "3. Run 'make docker-compose-up' for containerized development"
    echo "4. See DEPLOYMENT.md for production deployment instructions"
}

# Run main function
main "$@"
