#!/bin/bash

# StayWell Manager - ArgoCD Private Repository Authentication Setup
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

echo "🔐 ArgoCD Private Repository Authentication Setup"
echo "================================================"
echo ""

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    log_error "GitHub Personal Access Token not provided!"
    echo ""
    echo "To set up ArgoCD authentication for your private repository:"
    echo ""
    echo "1. Create a GitHub Personal Access Token:"
    echo "   - Go to: https://github.com/settings/tokens"
    echo "   - Click 'Generate new token (classic)'"
    echo "   - Select scopes: 'repo' (Full control of private repositories)"
    echo "   - Copy the generated token"
    echo ""
    echo "2. Run this script with your token:"
    echo "   GITHUB_TOKEN=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 ./scripts/setup-argocd-auth.sh"
    echo ""
    echo "3. Or apply the secret manually:"
    echo "   kubectl create secret generic staywell-repo-secret \\"
    echo "     --from-literal=type=git \\"
    echo "     --from-literal=url=https://github.com/pablodelarco/staywell-manager-e301a7db.git \\"
    echo "     --from-literal=username=pablodelarco \\"
    echo "     --from-literal=password=YOUR_TOKEN \\"
    echo "     -n argocd"
    echo "   kubectl label secret staywell-repo-secret \\"
    echo "     argocd.argoproj.io/secret-type=repository -n argocd"
    echo ""
    exit 1
fi

log_step "1. Creating ArgoCD repository secret..."

# Create the secret with the provided GitHub token
kubectl create secret generic staywell-repo-secret \
  --from-literal=type=git \
  --from-literal=url=https://github.com/pablodelarco/staywell-manager-e301a7db.git \
  --from-literal=username=pablodelarco \
  --from-literal=password="$GITHUB_TOKEN" \
  -n argocd \
  --dry-run=client -o yaml | kubectl apply -f -

# Label the secret so ArgoCD recognizes it
kubectl label secret staywell-repo-secret \
  argocd.argoproj.io/secret-type=repository -n argocd \
  --overwrite

log_success "✓ Repository secret created"

log_step "2. Refreshing ArgoCD applications..."

# Refresh the applications to pick up the new credentials
kubectl patch application staywell-dev -n argocd \
  --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"HEAD"}}}'

kubectl patch application staywell-prod -n argocd \
  --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"HEAD"}}}'

log_success "✓ Applications refreshed"

log_step "3. Waiting for ArgoCD to sync..."

# Wait a moment for ArgoCD to process
sleep 5

# Check application status
echo ""
log_info "Checking application status..."
kubectl get applications -n argocd -o custom-columns=NAME:.metadata.name,SYNC:.status.sync.status,HEALTH:.status.health.status

echo ""
log_step "4. Manual sync (if needed)..."

echo "If applications are still not syncing, you can manually sync them:"
echo ""
echo "# Via kubectl:"
echo "kubectl patch application staywell-dev -n argocd --type merge -p '{\"spec\":{\"syncPolicy\":{\"automated\":{\"prune\":true,\"selfHeal\":true}}}}'"
echo ""
echo "# Via ArgoCD UI:"
echo "1. Open: http://192.168.1.238"
echo "2. Login with admin / rWjEk-ZrQHAKWSro"
echo "3. Click on staywell-dev application"
echo "4. Click 'Sync' button"
echo ""

log_success "ArgoCD authentication setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Check ArgoCD UI: http://192.168.1.238"
echo "2. Verify applications are syncing"
echo "3. Check pod status: kubectl get pods -n staywell-manager-dev"
echo ""
