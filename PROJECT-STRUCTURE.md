# StayWell Manager - Project Structure

## Overview
This document outlines the complete project structure for the StayWell Manager SaaS platform, including containerization, CI/CD, and Kubernetes deployment.

## Repository Structure

```
staywell-manager/
├── 📁 src/                          # React application source code
│   ├── 📁 components/               # Reusable UI components
│   ├── 📁 contexts/                 # React contexts (Auth, Theme)
│   ├── 📁 hooks/                    # Custom React hooks
│   ├── 📁 integrations/             # External service integrations
│   ├── 📁 lib/                      # Utility functions
│   └── 📁 pages/                    # Application pages/routes
├── 📁 public/                       # Static assets
├── 📁 supabase/                     # Database migrations and config
├── 📁 k8s/                          # Kubernetes manifests
│   ├── 📁 base/                     # Base Kubernetes resources
│   ├── 📁 overlays/                 # Environment-specific configs
│   │   ├── 📁 development/          # Development environment
│   │   └── 📁 production/           # Production environment
│   └── 📁 monitoring/               # Monitoring configurations
├── 📁 argocd/                       # ArgoCD application definitions
├── 📁 .github/workflows/            # GitHub Actions CI/CD pipelines
├── 📁 scripts/                      # Deployment and setup scripts
├── 🐳 Dockerfile                    # Container definition
├── 🐳 docker-compose.yml            # Local development environment
├── ⚙️ nginx.conf                    # Nginx configuration for container
├── ⚙️ nginx-proxy.conf              # Nginx proxy for Docker Compose
├── 📋 Makefile                      # Common operations automation
└── 📚 Documentation files
```

## Key Components

### 🐳 **Containerization**
- **Dockerfile**: Multi-stage build for optimized production images
- **docker-compose.yml**: Local development environment with Redis
- **nginx.conf**: Production-ready nginx configuration
- **.dockerignore**: Optimized build context

### 🔄 **CI/CD Pipeline**
- **ci-cd.yml**: Main pipeline (test → build → deploy)
- **dependency-update.yml**: Automated dependency management
- **Security scanning**: Trivy vulnerability detection
- **Multi-platform builds**: AMD64 and ARM64 support

### ☸️ **Kubernetes Architecture**
- **Base manifests**: Core Kubernetes resources
- **Environment overlays**: Development and production configurations
- **Kustomize**: Environment-specific customizations
- **Security**: Non-root containers, security contexts, network policies

### 🚀 **GitOps Deployment**
- **ArgoCD applications**: Automated deployment management
- **Environment separation**: Dev auto-sync, prod manual approval
- **Rollback capabilities**: Easy reversion to previous versions
- **Health monitoring**: Comprehensive health checks

## Environment Strategy

### 🧪 **Development Environment**
```yaml
# Characteristics
Namespace: staywell-manager-dev
Domain: dev.staywell.com
Replicas: 1
Resources: Minimal (64Mi RAM, 50m CPU)
Auto-sync: Enabled
SSL: Let's Encrypt Staging
```

### 🏭 **Production Environment**
```yaml
# Characteristics
Namespace: staywell-manager
Domain: app.staywell.com + *.staywell.com
Replicas: 3-10 (auto-scaling)
Resources: Standard (256Mi RAM, 200m CPU)
Auto-sync: Disabled (manual approval)
SSL: Let's Encrypt Production
```

## Security Features

### 🔒 **Container Security**
- Non-root user execution (nginx:101)
- Read-only root filesystem
- Dropped Linux capabilities
- Minimal base images (Alpine Linux)

### 🛡️ **Kubernetes Security**
- Security contexts on all pods
- Network policies for traffic control
- RBAC for service accounts
- Pod Security Standards compliance

### 🔐 **Application Security**
- Environment variable validation
- CSP headers for XSS protection
- HTTPS everywhere with HSTS
- Rate limiting at ingress level

## Operational Features

### 📊 **Monitoring & Observability**
- **Health checks**: Application and infrastructure level
- **Metrics**: Prometheus-compatible endpoints (future)
- **Logging**: Structured JSON logs to stdout
- **Alerting**: Integration with monitoring stack

### 📈 **Scaling & Performance**
- **Horizontal Pod Autoscaler**: CPU and memory-based scaling
- **Pod Disruption Budget**: High availability during updates
- **Resource optimization**: Right-sized containers
- **Caching**: Nginx static asset caching

### 🔄 **Deployment Strategy**
- **Rolling updates**: Zero-downtime deployments
- **Canary deployments**: Gradual rollout capability
- **Blue-green**: Environment switching support
- **Rollback**: Automated rollback on health failures

## Development Workflow

### 🏠 **Local Development**
```bash
# Option 1: Native development
npm run dev

# Option 2: Docker Compose
make docker-compose-up

# Option 3: Kubernetes (Minikube)
make k8s-dev-deploy
```

### 🚀 **Deployment Process**
```bash
# Development deployment
git push origin develop
# → Triggers CI/CD → Auto-deploys to dev.staywell.com

# Production deployment
git push origin main
# → Triggers CI/CD → Manual approval → Deploys to app.staywell.com
```

## Configuration Management

### 📝 **Environment Variables**
```bash
# Application
VITE_APP_NAME=StayWell Manager
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Supabase
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
```

### 🗂️ **ConfigMaps vs Secrets**
- **ConfigMaps**: Non-sensitive configuration, feature flags
- **Secrets**: API keys, database credentials, certificates
- **Environment**: Runtime environment detection

## Future Enhancements

### 🏢 **Multi-tenancy Ready**
- Subdomain routing infrastructure in place
- Wildcard SSL certificate support
- Tenant isolation preparation

### 💰 **SaaS Features Preparation**
- Billing integration endpoints ready
- Usage tracking infrastructure
- Subscription management hooks

### 📊 **Observability Stack**
- Prometheus metrics collection
- Grafana dashboards
- ELK stack for centralized logging
- Jaeger for distributed tracing

## Quick Start Commands

### 🛠️ **Setup**
```bash
# Initial setup
./scripts/setup.sh

# Local development
make docker-compose-up

# Deploy to development
make k8s-dev-deploy
```

### 🔍 **Monitoring**
```bash
# Check deployment status
make k8s-prod-status

# View logs
make k8s-prod-logs

# Port forward for debugging
make port-forward-prod
```

### 🚀 **Deployment**
```bash
# Build and deploy to development
./scripts/deploy.sh dev --build --push

# Deploy to production (with confirmation)
./scripts/deploy.sh prod --version v1.2.0
```

This structure provides a solid foundation for scaling from MVP to enterprise SaaS platform while maintaining security, reliability, and developer experience.
