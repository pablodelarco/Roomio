#!/bin/bash

# StayWell Manager - GitOps Setup
# This script sets up the complete GitOps workflow

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

echo "🔄 StayWell Manager - GitOps CI/CD Setup"
echo "========================================"
echo ""

# Step 1: Initialize Git Repository
log_step "1. Setting up Git repository..."

if [ ! -d ".git" ]; then
    git init
    log_success "✓ Git repository initialized"
else
    log_info "Git repository already exists"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary files
tmp/
temp/
*.tmp

# Docker
.dockerignore
EOF
    log_success "✓ .gitignore created"
fi

# Step 2: Configure GitHub Container Registry
log_step "2. Configuring GitHub Container Registry..."

# Update kustomization to use GHCR
sed -i 's|newName:.*|newName: ghcr.io/pablodelarco/staywell-manager|g' k8s/overlays/development/kustomization.yaml
sed -i 's|newTag:.*|newTag: latest|g' k8s/overlays/development/kustomization.yaml

log_success "✓ Kustomization updated for GHCR"

# Step 3: Create GitHub Actions Workflow
log_step "3. Creating GitHub Actions workflow..."

mkdir -p .github/workflows

cat > .github/workflows/ci-cd.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build:prod

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
    
    - name: Security scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v3
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

  deploy-dev:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - name: Trigger ArgoCD Sync (Development)
      run: |
        echo "🚀 Development deployment triggered"
        echo "ArgoCD will automatically sync the changes"
        
  deploy-prod:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Trigger ArgoCD Sync (Production)
      run: |
        echo "🚀 Production deployment triggered"
        echo "ArgoCD will automatically sync the changes"
EOF

log_success "✓ GitHub Actions workflow created"

# Step 4: Create ArgoCD Application
log_step "4. Creating ArgoCD application configuration..."

# Update ArgoCD application to point to the GitHub repository
cat > argocd/applications/staywell-dev.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: staywell-dev
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/pablodelarco/staywell-manager.git
    targetRevision: develop
    path: k8s/overlays/development
  destination:
    server: https://kubernetes.default.svc
    namespace: staywell-manager-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
EOF

cat > argocd/applications/staywell-prod.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: staywell-prod
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/pablodelarco/staywell-manager.git
    targetRevision: main
    path: k8s/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: staywell-manager
  syncPolicy:
    automated:
      prune: false
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
EOF

log_success "✓ ArgoCD applications configured"

# Step 5: Create README with setup instructions
log_step "5. Creating documentation..."

cat > README.md << 'EOF'
# 🏠 StayWell Manager - Homelab SaaS

A modern property management SaaS application deployed on a homelab K3s cluster using GitOps.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Database + Auth)
- **Container**: Docker with nginx
- **Orchestration**: Kubernetes (K3s)
- **GitOps**: ArgoCD
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry (GHCR)

## 🚀 Deployment

### Automatic Deployment (GitOps)

1. **Push to `develop` branch** → Deploys to development environment
2. **Push to `main` branch** → Deploys to production environment
3. **ArgoCD** automatically syncs changes to the K3s cluster

### Manual Deployment

```bash
# Deploy to development
kubectl apply -k k8s/overlays/development

# Deploy to production
kubectl apply -k k8s/overlays/production
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:prod

# Run tests
npm test

# Build container
docker build -t staywell-manager .
```

## 🌐 Access

- **Development**: http://dev.staywell.local
- **Production**: http://staywell.local
- **ArgoCD**: http://192.168.1.238

## 📊 Monitoring

- **Kubernetes Dashboard**: Available via ArgoCD
- **Application Logs**: `kubectl logs -f deployment/staywell-frontend -n staywell-manager-dev`
- **Health Checks**: Built into the container

## 🔐 Security

- **Container Scanning**: Trivy security scans in CI/CD
- **Non-root User**: Container runs as nginx user
- **Network Policies**: Kubernetes network isolation
- **Secrets Management**: Kubernetes secrets for sensitive data

## 🏠 Homelab Infrastructure

- **Cluster**: 2-node K3s (beelink + worker)
- **Ingress**: Traefik LoadBalancer
- **GitOps**: ArgoCD
- **SSL**: cert-manager
- **Remote Access**: Tailscale

## 📝 Environment Variables

Create these secrets in Kubernetes:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: staywell-secrets
data:
  supabase-url: <base64-encoded-url>
  supabase-anon-key: <base64-encoded-key>
```

## 🎯 Next Steps

- [ ] Set up monitoring with Prometheus/Grafana
- [ ] Configure custom domain with SSL
- [ ] Add backup strategy
- [ ] Implement blue-green deployments
- [ ] Set up alerting
EOF

log_success "✓ Documentation created"

# Step 6: Commit and prepare for push
log_step "6. Preparing Git commit..."

git add .
git commit -m "feat: Initial StayWell Manager setup with GitOps

- Add React frontend with TypeScript
- Configure Docker multi-stage build
- Set up Kubernetes manifests with Kustomize
- Add GitHub Actions CI/CD pipeline
- Configure ArgoCD for GitOps deployment
- Add comprehensive documentation

Ready for homelab K3s deployment!"

log_success "✓ Changes committed to Git"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Create GitHub repository:"
echo "   gh repo create staywell-manager --public"
echo "   git remote add origin https://github.com/pablodelarco/staywell-manager.git"
echo ""
echo "2. Push code to GitHub:"
echo "   git push -u origin main"
echo ""
echo "3. Create develop branch:"
echo "   git checkout -b develop"
echo "   git push -u origin develop"
echo ""
echo "4. Deploy ArgoCD applications:"
echo "   kubectl apply -f argocd/applications/"
echo ""
echo "5. Access ArgoCD UI:"
echo "   http://192.168.1.238"
echo ""
echo "🚀 After this, every push will trigger automatic deployment!"
echo ""
log_success "GitOps setup complete! Ready for automated deployments."
