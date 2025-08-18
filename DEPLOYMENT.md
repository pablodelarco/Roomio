# StayWell Manager - Deployment Guide

## Overview
This document describes the deployment architecture and setup for StayWell Manager SaaS platform.

## Architecture

```
GitHub Repository → GitHub Actions → Container Registry → ArgoCD → Kubernetes
```

## Prerequisites

### Required Tools
- Docker & Docker Compose
- kubectl
- kustomize
- ArgoCD CLI (optional)

### Required Services
- Kubernetes cluster (GKE, EKS, or AKS)
- Container registry (GitHub Container Registry)
- Domain name with DNS management
- Supabase project

## Local Development

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your Supabase credentials
nano .env.local
```

### 2. Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access application
open http://localhost:80
```

### 3. Native Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access application
open http://localhost:8080
```

## Production Deployment

### 1. Container Registry Setup
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build and push image
docker build -t ghcr.io/your-username/staywell-manager:latest .
docker push ghcr.io/your-username/staywell-manager:latest
```

### 2. Kubernetes Cluster Setup
```bash
# Create namespace
kubectl apply -f k8s/base/namespace.yaml

# Apply secrets (update with real values first)
kubectl apply -f k8s/base/secret.yaml

# Deploy development environment
kubectl apply -k k8s/overlays/development

# Deploy production environment
kubectl apply -k k8s/overlays/production
```

### 3. ArgoCD Setup
```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply ArgoCD applications
kubectl apply -f argocd/applications/
```

## Environment Configuration

### Development
- **URL**: https://dev.staywell.com
- **Replicas**: 1
- **Resources**: Minimal (64Mi RAM, 50m CPU)
- **Auto-sync**: Enabled
- **SSL**: Let's Encrypt Staging

### Production
- **URL**: https://app.staywell.com
- **Replicas**: 3 (auto-scaling 3-10)
- **Resources**: Standard (256Mi RAM, 200m CPU)
- **Auto-sync**: Disabled (manual approval)
- **SSL**: Let's Encrypt Production

## Monitoring & Health Checks

### Health Endpoints
- **Application**: `/health`
- **Kubernetes**: Liveness and readiness probes configured

### Scaling
- **HPA**: CPU 70%, Memory 80%
- **PDB**: Minimum 2 pods available during disruptions

## Security

### Container Security
- Non-root user (nginx:101)
- Read-only root filesystem
- Dropped capabilities
- Security context constraints

### Network Security
- TLS termination at ingress
- Security headers configured
- Rate limiting enabled
- CORS policies applied

## Secrets Management

### Required Secrets
```bash
# Supabase credentials
kubectl create secret generic staywell-secrets \
  --from-literal=supabase-url="https://your-project.supabase.co" \
  --from-literal=supabase-anon-key="your-anon-key" \
  -n staywell-manager
```

### Future Secrets (for SaaS features)
- Stripe API keys
- Sentry DSN
- Email service credentials
- Analytics tokens

## Troubleshooting

### Common Issues
1. **Image pull errors**: Check registry credentials
2. **Health check failures**: Verify nginx configuration
3. **DNS issues**: Check ingress and DNS settings
4. **Resource limits**: Monitor pod resource usage

### Useful Commands
```bash
# Check pod status
kubectl get pods -n staywell-manager

# View logs
kubectl logs -f deployment/staywell-frontend -n staywell-manager

# Describe resources
kubectl describe deployment staywell-frontend -n staywell-manager

# Port forward for debugging
kubectl port-forward svc/staywell-frontend-service 8080:80 -n staywell-manager
```

## Next Steps

1. **Multi-tenancy**: Add tenant isolation
2. **API Layer**: Implement backend API
3. **Monitoring**: Add Prometheus/Grafana
4. **Logging**: Implement centralized logging
5. **Backup**: Database backup strategy
