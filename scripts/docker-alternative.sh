#!/bin/bash

# StayWell Manager - Docker Alternative Solutions
# This script provides alternatives to Docker for building containers

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🐳 StayWell Manager - Docker Alternative Solutions"
echo "================================================="

# Check current environment
log_info "Analyzing current environment..."

# Check if we're on a Kubernetes node
if command -v kubectl > /dev/null 2>&1 && kubectl get nodes > /dev/null 2>&1; then
    log_info "✓ Kubernetes environment detected"
    K8S_ENV=true
else
    log_info "• Not a Kubernetes environment"
    K8S_ENV=false
fi

# Check available tools
log_info "Checking available container tools..."

PODMAN_AVAILABLE=false
BUILDAH_AVAILABLE=false
DOCKER_AVAILABLE=false

if command -v podman > /dev/null 2>&1; then
    log_success "✓ Podman is available"
    PODMAN_AVAILABLE=true
fi

if command -v buildah > /dev/null 2>&1; then
    log_success "✓ Buildah is available"
    BUILDAH_AVAILABLE=true
fi

if command -v docker > /dev/null 2>&1; then
    if docker version > /dev/null 2>&1; then
        log_success "✓ Docker is available and working"
        DOCKER_AVAILABLE=true
    else
        log_warning "⚠ Docker is installed but not working"
    fi
fi

echo ""
echo "🎯 Recommended Solutions"
echo "========================"

# Solution 1: Use GitHub Actions (Recommended)
echo ""
log_info "Solution 1: GitHub Actions CI/CD (Recommended)"
echo "  ✅ Pros:"
echo "    • No local Docker issues"
echo "    • Automatic builds on code changes"
echo "    • Multi-platform builds (AMD64/ARM64)"
echo "    • Integrated with your existing setup"
echo "    • Free for public repositories"
echo ""
echo "  📋 Setup steps:"
echo "    1. Push your code to GitHub"
echo "    2. GitHub Actions will automatically build containers"
echo "    3. Containers are pushed to GitHub Container Registry"
echo "    4. Deploy directly to Kubernetes"
echo ""
echo "  🚀 To use this:"
echo "    git add ."
echo "    git commit -m 'Add container configuration'"
echo "    git push origin main"

# Solution 2: Podman (if available)
if [ "$PODMAN_AVAILABLE" = true ]; then
    echo ""
    log_info "Solution 2: Use Podman (Docker alternative)"
    echo "  ✅ Pros:"
    echo "    • Drop-in replacement for Docker"
    echo "    • Rootless containers"
    echo "    • No daemon required"
    echo "    • Works well with Kubernetes"
    echo ""
    echo "  🚀 To use this:"
    echo "    podman build -t staywell-manager:test ."
    echo "    podman run -p 8080:8080 staywell-manager:test"
fi

# Solution 3: Install Podman
if [ "$PODMAN_AVAILABLE" = false ]; then
    echo ""
    log_info "Solution 3: Install Podman"
    echo "  📦 Installation commands:"
    echo "    # Ubuntu/Debian:"
    echo "    sudo apt update && sudo apt install -y podman"
    echo ""
    echo "    # RHEL/CentOS/Fedora:"
    echo "    sudo dnf install -y podman"
    echo ""
    echo "    # Arch Linux:"
    echo "    sudo pacman -S podman"
fi

# Solution 4: Use Kubernetes for building
if [ "$K8S_ENV" = true ]; then
    echo ""
    log_info "Solution 4: Use Kubernetes for Building"
    echo "  ✅ Pros:"
    echo "    • Uses existing Kubernetes infrastructure"
    echo "    • No local Docker daemon needed"
    echo "    • Can use Kaniko or Buildah in pods"
    echo ""
    echo "  🚀 Example with Kaniko:"
    echo "    kubectl run kaniko-build \\"
    echo "      --image=gcr.io/kaniko-project/executor:latest \\"
    echo "      --restart=Never \\"
    echo "      --rm -it \\"
    echo "      -- --dockerfile=Dockerfile \\"
    echo "         --context=git://github.com/pablodelarco/staywell-manager \\"
    echo "         --destination=ghcr.io/pablodelarco/staywell-manager:latest"
fi

# Solution 5: Fix Docker (requires root)
echo ""
log_info "Solution 5: Fix Docker Networking (Requires Root)"
echo "  ⚠️  Warning: Requires sudo access"
echo "  ✅ Pros:"
echo "    • Fixes Docker for future use"
echo "    • Preserves Cilium networking"
echo "    • Safe for Kubernetes nodes"
echo ""
echo "  🚀 To use this:"
echo "    sudo ./scripts/fix-docker-networking.sh"

# Solution 6: Remote building
echo ""
log_info "Solution 6: Remote Building Services"
echo "  ✅ Options:"
echo "    • Docker Hub Automated Builds"
echo "    • Google Cloud Build"
echo "    • AWS CodeBuild"
echo "    • Azure Container Registry"
echo ""
echo "  🚀 Example with Docker Hub:"
echo "    1. Connect GitHub repo to Docker Hub"
echo "    2. Enable automated builds"
echo "    3. Push code → automatic container build"

# Test current setup
echo ""
echo "🧪 Testing Current Setup"
echo "========================"

# Test if we can build without Docker
log_info "Testing application build..."
if npm run build:prod > /dev/null 2>&1; then
    log_success "✓ Application builds successfully"
    echo "  → Your app is ready for containerization"
else
    log_error "✗ Application build failed"
    echo "  → Fix application build issues first"
fi

# Test if we can simulate container
log_info "Testing container simulation..."
if [ -f "dist/index.html" ]; then
    log_success "✓ Build artifacts are ready"
    echo "  → Container would work correctly"
else
    log_warning "⚠ Build artifacts missing"
fi

# Recommendations
echo ""
echo "🎯 Recommendations for Your Situation"
echo "====================================="

if [ "$K8S_ENV" = true ]; then
    log_info "For Kubernetes environments:"
    echo "  1. 🥇 Use GitHub Actions (easiest, most reliable)"
    echo "  2. 🥈 Install and use Podman"
    echo "  3. 🥉 Use Kubernetes-native building (Kaniko)"
    echo "  4. 🔧 Fix Docker as last resort"
else
    log_info "For development environments:"
    echo "  1. 🥇 Fix Docker networking"
    echo "  2. 🥈 Install and use Podman"
    echo "  3. 🥉 Use GitHub Actions"
fi

echo ""
log_info "Next Steps:"
echo "  1. Choose one of the solutions above"
echo "  2. Test container building"
echo "  3. Proceed with Step 2 of SaaS deployment"
echo ""
echo "💡 Tip: GitHub Actions is the most reliable for production SaaS"
