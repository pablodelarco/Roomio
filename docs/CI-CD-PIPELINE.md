# CI/CD Pipeline Documentation

## Overview

This document describes the complete CI/CD pipeline for the StayWell Manager application, which automatically builds, tests, and deploys the application whenever code is pushed to the repository.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Developer     │    │   GitHub Actions │    │   ArgoCD        │
│   Commits Code  │───▶│   Build & Push   │───▶│   Deploy to K8s │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                         │
                              ▼                         ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ GitHub Container │    │  Kubernetes     │
                       │    Registry      │    │    Cluster      │
                       └──────────────────┘    └─────────────────┘
```

## Pipeline Stages

### 1. Code Push Trigger
- **Trigger**: Push to `main` or `develop` branches
- **Trigger**: Pull request to `main` branch

### 2. GitHub Actions Workflow

#### Stage 1: Test
- ✅ Checkout code
- ✅ Setup Node.js 18
- ✅ Install dependencies (`npm ci`)
- ✅ Run tests (`npm test`)
- ✅ Build application (`npm run build:prod`)

#### Stage 2: Build & Push Docker Image
- ✅ Login to GitHub Container Registry (ghcr.io)
- ✅ Extract metadata (tags, labels)
- ✅ Build Docker image
- ✅ Push to `ghcr.io/pablodelarco/staywell-manager-e301a7db`
- ✅ Security scan with Trivy
- ✅ Update Kubernetes manifests with new image tag
- ✅ Commit updated manifests back to repository

#### Stage 3: Deployment Notification
- ✅ Development: Triggered on `develop` branch
- ✅ Production: Triggered on `main` branch

### 3. ArgoCD GitOps Deployment
- ✅ ArgoCD monitors the repository for changes
- ✅ Automatically syncs when manifests are updated
- ✅ Deploys to Kubernetes cluster
- ✅ Self-healing and pruning enabled

## Configuration

### GitHub Actions Secrets
No additional secrets required - uses `GITHUB_TOKEN` for container registry access.

### Environment Variables
```yaml
REGISTRY: ghcr.io
IMAGE_NAME: staywell-manager-e301a7db
```

### Docker Image Tags
- `develop` branch → `ghcr.io/pablodelarco/staywell-manager-e301a7db:develop`
- `main` branch → `ghcr.io/pablodelarco/staywell-manager-e301a7db:latest`
- All commits → `ghcr.io/pablodelarco/staywell-manager-e301a7db:sha-<commit>`

## ArgoCD Applications

### Development Environment
- **Name**: `staywell-dev`
- **Namespace**: `staywell-manager-dev`
- **Source**: `k8s/` directory
- **Branch**: `develop`
- **Sync Policy**: Automated (prune + self-heal)

### Production Environment
- **Name**: `staywell-prod`
- **Namespace**: `staywell-manager`
- **Source**: `k8s/` directory
- **Branch**: `main`
- **Sync Policy**: Manual (self-heal only)

## Monitoring & Troubleshooting

### Monitor Pipeline Status
```bash
# Run the monitoring script
./scripts/monitor-cicd.sh

# Check GitHub Actions
open https://github.com/pablodelarco/staywell-manager-e301a7db/actions

# Check ArgoCD applications
kubectl get applications -n argocd

# Check deployment status
kubectl get deployments -n staywell-manager-dev
```

### Common Issues

#### 1. GitHub Actions Fails
- Check workflow logs in GitHub Actions tab
- Verify Docker build context
- Check if tests are passing

#### 2. ArgoCD Sync Issues
```bash
# Force refresh ArgoCD application
kubectl patch application staywell-dev -n argocd --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"HEAD"}}}'

# Check ArgoCD logs
kubectl logs -n argocd deployment/argocd-application-controller
```

#### 3. Deployment Not Ready
```bash
# Check pod status
kubectl get pods -n staywell-manager-dev

# Check pod logs
kubectl logs -n staywell-manager-dev deployment/staywell-frontend

# Check events
kubectl get events -n staywell-manager-dev --sort-by='.lastTimestamp'
```

## Security Features

### Container Security Scanning
- **Tool**: Trivy security scanner
- **Scope**: Vulnerabilities, misconfigurations, secrets
- **Action**: Scan results displayed in workflow logs
- **Policy**: Continues deployment (non-blocking)

### Image Security
- **Registry**: GitHub Container Registry (ghcr.io)
- **Access**: Private repository access required
- **Signing**: Images tagged with commit SHA for traceability

## Deployment Environments

### Development
- **URL**: http://192.168.1.106:30080
- **Namespace**: staywell-manager-dev
- **Auto-deploy**: ✅ On every `develop` commit
- **Resources**: Minimal (1 replica, 256Mi RAM, 200m CPU)

### Production
- **URL**: TBD (custom domain)
- **Namespace**: staywell-manager
- **Auto-deploy**: ❌ Manual approval required
- **Resources**: Production-ready (auto-scaling, higher limits)

## Next Steps

1. **Custom Domain Setup**: Configure production domain and SSL
2. **Environment Separation**: Implement proper dev/staging/prod environments
3. **Monitoring**: Add application monitoring and alerting
4. **Backup Strategy**: Implement database and configuration backups
5. **Performance**: Add performance testing to pipeline

## Quick Commands

```bash
# Trigger deployment manually
git commit --allow-empty -m "trigger deployment"
git push origin develop

# Check pipeline status
./scripts/monitor-cicd.sh

# Access application
open http://192.168.1.106:30080

# Check ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
open https://localhost:8080
```
