#!/bin/bash

# StayWell Manager - Homelab K3s Deployment
# Deploy to existing homelab K3s cluster

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

echo "🏠 StayWell Manager - Homelab K3s Deployment"
echo "============================================"
echo ""

# Step 1: Verify K3s cluster
log_step "1. Verifying K3s cluster access..."

if ! command -v kubectl > /dev/null 2>&1; then
    log_error "kubectl not found. Please install kubectl first."
    exit 1
fi

if ! kubectl cluster-info > /dev/null 2>&1; then
    log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

CLUSTER_INFO=$(kubectl cluster-info | head -1)
log_success "✓ Connected to cluster: $CLUSTER_INFO"

# Get cluster nodes
NODES=$(kubectl get nodes --no-headers | wc -l)
log_info "Cluster has $NODES node(s)"

kubectl get nodes -o wide
echo ""

# Step 2: Check existing infrastructure
log_step "2. Checking existing cluster infrastructure..."

# Check for ingress controller
if kubectl get pods -n kube-system | grep -q "traefik\|nginx\|ingress"; then
    INGRESS_CONTROLLER=$(kubectl get pods -n kube-system | grep -E "traefik|nginx|ingress" | head -1 | awk '{print $1}')
    log_success "✓ Ingress controller found: $INGRESS_CONTROLLER"
else
    log_warning "⚠ No ingress controller detected. We'll set up Traefik."
fi

# Check for cert-manager
if kubectl get pods -A | grep -q "cert-manager"; then
    log_success "✓ cert-manager found"
else
    log_warning "⚠ cert-manager not found. We'll install it for SSL."
fi

# Check for ArgoCD
if kubectl get pods -A | grep -q "argocd"; then
    log_success "✓ ArgoCD found"
else
    log_warning "⚠ ArgoCD not found. We'll install it for GitOps."
fi

echo ""

# Step 3: Build and push container to local registry
log_step "3. Setting up container image..."

# Check if we have a local registry
if kubectl get svc -A | grep -q "registry"; then
    REGISTRY_URL=$(kubectl get svc -A | grep registry | awk '{print $4":"$6}' | sed 's/\/.*//g')
    log_success "✓ Local registry found: $REGISTRY_URL"
    USE_LOCAL_REGISTRY=true
else
    log_info "No local registry found. We'll use the local Docker image."
    USE_LOCAL_REGISTRY=false
fi

# Build the container image
log_info "Building container image..."
if docker build -t staywell-manager:homelab .; then
    log_success "✓ Container built successfully"
else
    log_error "✗ Container build failed"
    exit 1
fi

if [ "$USE_LOCAL_REGISTRY" = true ]; then
    # Tag and push to local registry
    docker tag staywell-manager:homelab $REGISTRY_URL/staywell-manager:latest
    docker push $REGISTRY_URL/staywell-manager:latest
    log_success "✓ Image pushed to local registry"
    IMAGE_NAME="$REGISTRY_URL/staywell-manager:latest"
else
    # Use local image with imagePullPolicy: Never
    IMAGE_NAME="staywell-manager:homelab"
    log_info "Using local Docker image (will need to be present on all nodes)"
fi

echo ""

# Step 4: Create namespace
log_step "4. Creating Kubernetes namespace..."

kubectl create namespace staywell-manager --dry-run=client -o yaml | kubectl apply -f -
log_success "✓ Namespace 'staywell-manager' ready"

echo ""

# Step 5: Deploy the application
log_step "5. Deploying StayWell Manager..."

# Update the image name in kustomization
if [ "$USE_LOCAL_REGISTRY" = true ]; then
    # Update kustomization to use registry image
    sed -i "s|newTag:.*|newTag: latest|g" k8s/overlays/development/kustomization.yaml
    sed -i "s|newName:.*|newName: $REGISTRY_URL/staywell-manager|g" k8s/overlays/development/kustomization.yaml
else
    # Update kustomization to use local image
    sed -i "s|newTag:.*|newTag: homelab|g" k8s/overlays/development/kustomization.yaml
    sed -i "s|newName:.*|newName: staywell-manager|g" k8s/overlays/development/kustomization.yaml
    
    # Add imagePullPolicy: Never to deployment patch
    cat > k8s/overlays/development/image-policy-patch.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: staywell-frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        imagePullPolicy: Never
EOF
    
    # Add the patch to kustomization
    if ! grep -q "image-policy-patch.yaml" k8s/overlays/development/kustomization.yaml; then
        echo "- image-policy-patch.yaml" >> k8s/overlays/development/kustomization.yaml
    fi
fi

# Deploy using kustomize
if kubectl apply -k k8s/overlays/development; then
    log_success "✓ Application deployed successfully"
else
    log_error "✗ Deployment failed"
    exit 1
fi

echo ""

# Step 6: Wait for deployment
log_step "6. Waiting for deployment to be ready..."

kubectl wait --for=condition=available --timeout=300s deployment/dev-staywell-frontend -n staywell-manager-dev

if [ $? -eq 0 ]; then
    log_success "✓ Deployment is ready!"
else
    log_warning "⚠ Deployment is taking longer than expected"
    log_info "Check status with: kubectl get pods -n staywell-manager-dev"
fi

echo ""

# Step 7: Check service and ingress
log_step "7. Checking service access..."

# Get service info
SERVICE_IP=$(kubectl get svc dev-staywell-frontend-service -n staywell-manager-dev -o jsonpath='{.spec.clusterIP}')
SERVICE_PORT=$(kubectl get svc dev-staywell-frontend-service -n staywell-manager-dev -o jsonpath='{.spec.ports[0].port}')

log_info "Service available at: $SERVICE_IP:$SERVICE_PORT"

# Check if ingress is working
if kubectl get ingress -n staywell-manager-dev > /dev/null 2>&1; then
    INGRESS_HOST=$(kubectl get ingress dev-staywell-ingress -n staywell-manager-dev -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "localhost")
    log_info "Ingress configured for: $INGRESS_HOST"
    
    # Get ingress controller external IP
    EXTERNAL_IP=$(kubectl get svc -n kube-system | grep -E "traefik|nginx|ingress" | awk '{print $4}' | head -1)
    if [ "$EXTERNAL_IP" != "<pending>" ] && [ "$EXTERNAL_IP" != "<none>" ]; then
        log_success "✓ External access: http://$EXTERNAL_IP"
    else
        # Get node IP for NodePort access
        NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
        log_info "Access via NodePort: http://$NODE_IP:30080"
    fi
fi

echo ""

# Step 8: Display access information
log_step "8. Access Information"
echo "===================="
echo ""

echo "🌐 Application Access:"
echo "   • Cluster IP: http://$SERVICE_IP:$SERVICE_PORT"

if [ -n "$EXTERNAL_IP" ] && [ "$EXTERNAL_IP" != "<pending>" ] && [ "$EXTERNAL_IP" != "<none>" ]; then
    echo "   • External IP: http://$EXTERNAL_IP"
fi

NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
echo "   • Node IP: http://$NODE_IP:30080"

if [ -n "$INGRESS_HOST" ] && [ "$INGRESS_HOST" != "localhost" ]; then
    echo "   • Domain: http://$INGRESS_HOST"
fi

echo ""
echo "🔍 Monitoring Commands:"
echo "   • Pods: kubectl get pods -n staywell-manager-dev"
echo "   • Logs: kubectl logs -f deployment/dev-staywell-frontend -n staywell-manager-dev"
echo "   • Service: kubectl get svc -n staywell-manager-dev"
echo "   • Ingress: kubectl get ingress -n staywell-manager-dev"

echo ""
echo "🚀 Next Steps:"
echo "   1. Test the application in your browser"
echo "   2. Configure your router for external access (port forwarding)"
echo "   3. Set up a domain name (optional)"
echo "   4. Install monitoring stack (optional)"

echo ""
log_success "🎉 StayWell Manager deployed to your homelab K3s cluster!"

# Test connectivity
echo ""
log_info "Testing application connectivity..."
if curl -s -o /dev/null -w "%{http_code}" http://$SERVICE_IP:$SERVICE_PORT | grep -q "200"; then
    log_success "✓ Application is responding!"
else
    log_warning "⚠ Application may still be starting up"
    log_info "Wait a moment and check: curl http://$SERVICE_IP:$SERVICE_PORT"
fi
