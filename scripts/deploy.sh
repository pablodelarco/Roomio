#!/bin/bash

# StayWell Manager - Deployment Script
# This script handles deployment to different environments

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOCKER_IMAGE="ghcr.io/your-username/staywell-manager"
GITOPS_REPO="https://github.com/your-username/staywell-manager-gitops.git"

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Environments:"
    echo "  dev         Deploy to development environment"
    echo "  prod        Deploy to production environment"
    echo "  local       Run locally with Docker Compose"
    echo ""
    echo "Options:"
    echo "  --build     Build new Docker image before deployment"
    echo "  --push      Push Docker image to registry"
    echo "  --version   Specify image version (default: latest)"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev --build                    # Build and deploy to dev"
    echo "  $0 prod --version v1.2.0          # Deploy specific version to prod"
    echo "  $0 local                          # Run locally"
}

build_image() {
    local version=${1:-latest}
    log_info "Building Docker image: ${DOCKER_IMAGE}:${version}"
    docker build -t "${DOCKER_IMAGE}:${version}" .
    log_success "Image built successfully"
}

push_image() {
    local version=${1:-latest}
    log_info "Pushing Docker image: ${DOCKER_IMAGE}:${version}"
    docker push "${DOCKER_IMAGE}:${version}"
    log_success "Image pushed successfully"
}

deploy_local() {
    log_info "Starting local development environment..."
    docker-compose up --build -d
    log_success "Local environment started"
    log_info "Access the application at: http://localhost:80"
}

deploy_k8s() {
    local env=$1
    local version=${2:-latest}
    
    log_info "Deploying to ${env} environment..."
    
    # Validate kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Apply manifests
    case $env in
        "dev")
            kubectl apply -k k8s/overlays/development
            log_success "Deployed to development environment"
            log_info "Access at: https://dev.staywell.com"
            ;;
        "prod")
            log_warning "Deploying to PRODUCTION environment"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kubectl apply -k k8s/overlays/production
                log_success "Deployed to production environment"
                log_info "Access at: https://app.staywell.com"
            else
                log_info "Deployment cancelled"
                exit 0
            fi
            ;;
        *)
            log_error "Unknown environment: $env"
            usage
            exit 1
            ;;
    esac
}

# Main script
main() {
    local environment=""
    local should_build=false
    local should_push=false
    local version="latest"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            dev|prod|local)
                environment="$1"
                shift
                ;;
            --build)
                should_build=true
                shift
                ;;
            --push)
                should_push=true
                shift
                ;;
            --version)
                version="$2"
                shift 2
                ;;
            --help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Validate environment
    if [[ -z "$environment" ]]; then
        log_error "Environment is required"
        usage
        exit 1
    fi
    
    # Build image if requested
    if [[ "$should_build" == true ]]; then
        build_image "$version"
    fi
    
    # Push image if requested
    if [[ "$should_push" == true ]]; then
        push_image "$version"
    fi
    
    # Deploy based on environment
    case $environment in
        "local")
            deploy_local
            ;;
        "dev"|"prod")
            deploy_k8s "$environment" "$version"
            ;;
    esac
}

# Run main function with all arguments
main "$@"
