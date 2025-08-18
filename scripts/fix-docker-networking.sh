#!/bin/bash

# StayWell Manager - Docker Networking Fix
# This script fixes Docker daemon networking issues on Kubernetes nodes

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

echo "🔧 StayWell Manager - Docker Networking Fix"
echo "==========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

# Diagnose the issue
log_info "Diagnosing Docker networking issue..."

# Check if docker0 bridge exists
if ip link show docker0 > /dev/null 2>&1; then
    log_success "docker0 bridge exists"
else
    log_warning "docker0 bridge does not exist"
    NEED_BRIDGE=true
fi

# Check Docker daemon status
if systemctl is-active --quiet docker; then
    log_success "Docker daemon is running"
else
    log_error "Docker daemon is not running"
    exit 1
fi

# Check if this is a Kubernetes node
if command -v kubectl > /dev/null 2>&1 && kubectl get nodes > /dev/null 2>&1; then
    log_info "Detected Kubernetes environment"
    K8S_NODE=true
else
    log_info "Not a Kubernetes environment"
    K8S_NODE=false
fi

# Solution 1: Restart Docker daemon to recreate bridge
log_info "Attempting Solution 1: Restart Docker daemon..."

systemctl stop docker
sleep 2

# DO NOT clean up CNI interfaces - preserve Cilium networking
log_info "Preserving existing CNI networking (Cilium)"

# Start Docker daemon
log_info "Starting Docker daemon..."
systemctl start docker
sleep 5

# Check if docker0 was created
if ip link show docker0 > /dev/null 2>&1; then
    log_success "docker0 bridge created successfully"
    BRIDGE_FIXED=true
else
    log_warning "docker0 bridge still not created"
    BRIDGE_FIXED=false
fi

# Solution 2: Manually create docker0 bridge if needed (safe for Cilium)
if [ "$BRIDGE_FIXED" = false ]; then
    log_info "Attempting Solution 2: Create docker0 bridge (preserving Cilium)..."

    # Use a different subnet to avoid conflicts with Cilium
    # Cilium typically uses 10.0.0.0/8, so we'll use 172.17.0.0/16 for Docker

    # Create docker0 bridge with non-conflicting configuration
    ip link add name docker0 type bridge
    ip addr add 172.17.0.1/16 dev docker0
    ip link set docker0 up

    # Add minimal iptables rules that don't conflict with Cilium
    # Only add if they don't already exist
    if ! iptables -t nat -C POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE 2>/dev/null; then
        iptables -t nat -A POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE
    fi

    log_success "docker0 bridge created (Cilium-safe)"

    # Restart Docker to use the new bridge
    systemctl restart docker
    sleep 5
fi

# Solution 3: Configure Docker to coexist with Cilium
if [ "$K8S_NODE" = true ] && [ "$BRIDGE_FIXED" = false ]; then
    log_info "Attempting Solution 3: Configure Docker to coexist with Cilium..."

    # Backup existing Docker configuration
    if [ -f /etc/docker/daemon.json ]; then
        cp /etc/docker/daemon.json /etc/docker/daemon.json.backup
        log_info "Backed up existing Docker configuration"
    fi

    # Create Docker daemon configuration that coexists with Cilium
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << EOF
{
    "bip": "172.17.0.1/16",
    "fixed-cidr": "172.17.0.0/16",
    "iptables": true,
    "ip-masq": true,
    "storage-driver": "overlay2",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "live-restore": true
}
EOF

    log_info "Configured Docker to coexist with Cilium"
    systemctl restart docker
    sleep 5
fi

# Test Docker functionality
log_info "Testing Docker functionality..."

# Test 1: Basic Docker command
if docker version > /dev/null 2>&1; then
    log_success "✓ Docker daemon is responding"
else
    log_error "✗ Docker daemon is not responding"
    exit 1
fi

# Test 2: Try to run a simple container
log_info "Testing container creation..."
if docker run --rm hello-world > /dev/null 2>&1; then
    log_success "✓ Container creation works"
    DOCKER_WORKING=true
else
    log_warning "⚠ Container creation failed, but daemon is working"
    DOCKER_WORKING=false
fi

# Test 3: Try to build a simple image
if [ "$DOCKER_WORKING" = true ]; then
    log_info "Testing image building..."
    
    # Create a simple test Dockerfile
    mkdir -p /tmp/docker-test
    cat > /tmp/docker-test/Dockerfile << EOF
FROM alpine:latest
RUN echo "Docker build test"
EOF
    
    if docker build -t docker-test /tmp/docker-test > /dev/null 2>&1; then
        log_success "✓ Docker build works"
        docker rmi docker-test > /dev/null 2>&1 || true
    else
        log_warning "⚠ Docker build failed"
    fi
    
    rm -rf /tmp/docker-test
fi

# Final status
echo ""
echo "📋 Docker Networking Fix Summary"
echo "================================"

if ip link show docker0 > /dev/null 2>&1; then
    log_success "✅ docker0 bridge is present"
else
    log_warning "⚠ docker0 bridge is not present (may be using host networking)"
fi

if docker version > /dev/null 2>&1; then
    log_success "✅ Docker daemon is working"
else
    log_error "❌ Docker daemon is not working"
fi

if [ "$DOCKER_WORKING" = true ]; then
    log_success "✅ Docker containers can be created"
else
    log_warning "⚠ Docker containers may have issues"
fi

echo ""
if [ "$K8S_NODE" = true ]; then
    log_info "🎯 Kubernetes Environment Detected"
    echo ""
    echo "For Kubernetes environments, consider using:"
    echo "  • Podman instead of Docker for local builds"
    echo "  • GitHub Actions for CI/CD builds"
    echo "  • Kubernetes Jobs for container builds"
    echo "  • External build services (Docker Hub, etc.)"
else
    log_info "🎯 Standalone Docker Environment"
    echo ""
    echo "Docker should now work for:"
    echo "  • Building your StayWell Manager container"
    echo "  • Running containers locally"
    echo "  • Testing deployments"
fi

echo ""
log_info "Next steps:"
echo "  1. Try building your StayWell Manager container:"
echo "     docker build -t staywell-manager:test ."
echo "  2. If it still fails, use GitHub Actions for builds"
echo "  3. Deploy directly to Kubernetes for testing"
