# 🏠 StayWell Manager - Homelab SaaS

A modern property management SaaS application deployed on a homelab K3s cluster using GitOps.

## 🚀 Status: GitOps Deployment Active

- ✅ **ArgoCD**: Configured and syncing
- ✅ **GitHub Actions**: CI/CD pipeline ready
- ✅ **K3s Cluster**: 2-node homelab deployment
- 🔄 **Building**: First container image...

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

⚠️ **IMPORTANT**: Before deploying, you must replace the placeholder values in:
- `k8s/base/secret.yaml` - Replace with your actual Supabase credentials
- `nginx.conf` - Update CSP with your Supabase URL
- `scripts/setup-argocd-auth.sh` - Update with your ArgoCD IP

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
