# StayWell Manager - GitOps Strategy

## Repository Structure

This project follows a GitOps approach with separate repositories:

### 1. Application Repository (Current)
- **Purpose**: Source code, Dockerfile, CI/CD pipelines
- **Repository**: `staywell-manager`
- **Triggers**: Code changes trigger builds and image pushes

### 2. GitOps Repository (To be created)
- **Purpose**: Kubernetes manifests, environment configurations
- **Repository**: `staywell-manager-gitops`
- **Structure**:
```
staywell-manager-gitops/
├── environments/
│   ├── development/
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── production/
│       ├── kustomization.yaml
│       └── patches/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
└── argocd/
    ├── applications/
    └── projects/
```

## GitOps Workflow

### 1. Development Flow
```
Developer → Push Code → GitHub Actions → Build Image → Update GitOps Repo → ArgoCD Sync → Deploy
```

### 2. Production Flow
```
Merge to Main → GitHub Actions → Build Image → Update GitOps Repo → Manual ArgoCD Sync → Deploy
```

## Environment Management

### Development Environment
- **Auto-sync**: Enabled
- **Namespace**: `staywell-manager-dev`
- **Domain**: `dev.staywell.com`
- **Image Tag**: `develop-latest`

### Production Environment
- **Auto-sync**: Disabled (manual approval)
- **Namespace**: `staywell-manager`
- **Domain**: `app.staywell.com`
- **Image Tag**: `main-latest`

## ArgoCD Configuration

### Application Sync Policies
- **Development**: Automatic sync with self-healing
- **Production**: Manual sync for safety
- **Rollback**: Automatic rollback on health check failures

### Health Checks
- **Deployment**: Ready replicas match desired
- **Service**: Endpoints are available
- **Ingress**: TLS certificates are valid

## Security Considerations

### GitOps Repository Access
- **Read Access**: ArgoCD service account
- **Write Access**: GitHub Actions with limited scope token
- **Branch Protection**: Require PR reviews for production changes

### Secrets Management
- **Development**: Kubernetes secrets with base64 encoding
- **Production**: External secret management (Vault, AWS Secrets Manager)
- **Rotation**: Automated secret rotation policies

## Monitoring GitOps

### ArgoCD Metrics
- Application sync status
- Deployment success/failure rates
- Time to deployment
- Rollback frequency

### Alerts
- Failed deployments
- Out-of-sync applications
- Certificate expiration
- Resource quota exceeded

## Best Practices

### 1. Manifest Management
- Use Kustomize for environment-specific configurations
- Keep base manifests environment-agnostic
- Version control all changes

### 2. Deployment Safety
- Always test in development first
- Use canary deployments for critical changes
- Maintain rollback procedures

### 3. Change Management
- Document all configuration changes
- Use descriptive commit messages
- Tag releases for production deployments

## Setup Instructions

### 1. Create GitOps Repository
```bash
# Create new repository
gh repo create staywell-manager-gitops --private

# Clone and setup
git clone https://github.com/your-username/staywell-manager-gitops.git
cd staywell-manager-gitops

# Copy manifests from this repository
cp -r ../staywell-manager/k8s ./
cp -r ../staywell-manager/argocd ./

# Initial commit
git add .
git commit -m "Initial GitOps setup"
git push origin main
```

### 2. Configure GitHub Actions
```bash
# Create GitHub token with repo access
gh auth token

# Add token as repository secret
gh secret set GITOPS_TOKEN --body "your-token-here"
```

### 3. Install ArgoCD
```bash
# Install ArgoCD in cluster
make argocd-install

# Deploy applications
make argocd-apps

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

## Troubleshooting

### Common Issues
1. **Sync failures**: Check manifest syntax and resource quotas
2. **Image pull errors**: Verify registry credentials and image tags
3. **Health check failures**: Review application logs and resource limits

### Useful Commands
```bash
# Check ArgoCD application status
argocd app list

# Sync application manually
argocd app sync staywell-manager-prod

# View application details
argocd app get staywell-manager-prod

# Rollback to previous version
argocd app rollback staywell-manager-prod
```
