# StayWell Manager – Homelab SaaS Platform

**StayWell Manager** is a modern property management SaaS deployed on a self-hosted K3s cluster with a complete GitOps-powered CI/CD pipeline. Built as a side project to demonstrate scalable, automated deployments using cloud-native best practices.

---

##  Architecture & Tech Stack

- **Frontend:** React + TypeScript + Vite  
- **Backend:** Supabase (Database + Authentication)  
- **Containerization:** Docker with nginx (non-root user)  
- **Kubernetes Orchestration:** K3s  
- **GitOps:** ArgoCD  
- **CI/CD:** GitHub Actions (test → build → scan → deploy)  
- **Registry:** GitHub Container Registry (GHCR)  
- **Security:** Trivy container scanning in CI  
- **Networking & Ingress:** Traefik, Tailscale for remote access, Cert-Manager for SSL  
- **Infrastructure:** 2-node homelab cluster (beelink + worker); GitOps overlays for `development` and `production`

---

##  CI/CD Workflow

1. **Push to `develop` branch** → Pipeline runs, builds container images, runs security scans, updates dev overlay → ArgoCD syncs to the development environment.  
2. **Push to `main` branch** → Same pipeline, followed by ArgoCD deployment to production cluster.  
3. **GitOps at the core**: Ensures deployments remain transparent, auditable, and easily revertible.

---

##  Why It Matters

- Demonstrates hands-on experience with **end-to-end DevOps and GitOps workflows**—from local development to production-grade orchestration.  
- Transparent, Git-based deployment ensures **traceability and reproducibility**.  
- Security is integrated early through **automated container scanning with Trivy**.  
- Fully autonomous delivery pipeline—ideal for continuous iteration and fast-feature delivery in SaaS.

---

##  Setup & Development

```bash
# Local development:
npm install
npm run dev

# Test suite:
npm test

# Production build:
npm run build:prod

# Build container locally:
docker build -t staywell-manager .

<<<<<<< HEAD
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
=======
# GitOps manual triggers:
kubectl apply -k k8s/overlays/development
kubectl apply -k k8s/overlays/production
>>>>>>> origin/main
# GitOps Test - Fri Aug 29 12:06:25 PM CEST 2025
