# 🎨 Rebranding Summary: StayWell Manager → Roomio

## ✅ Completed Changes

### 1. **Application Files**
- ✅ `package.json` - Updated name to "roomio"
- ✅ `index.html` - Updated title and meta tags to "Roomio - Property Management Platform"

### 2. **Kubernetes Base Manifests** (`k8s/base/`)
- ✅ `namespace.yaml` - Changed from `staywell-manager` to `roomio`
- ✅ `deployment.yaml` - Changed from `staywell-frontend` to `roomio-frontend`
- ✅ `service.yaml` - Changed from `staywell-frontend-service` to `roomio-frontend-service`
- ✅ `ingress.yaml` - Changed from `staywell-ingress` to `roomio-ingress`
  - Updated domain from `pablodelarco.com` to `www.roomio.com`
  - Updated secret name from `staywell-tls-secret` to `roomio-tls-secret`
  - Updated Docker image from `ghcr.io/pablodelarco/staywell-manager-e301a7db` to `ghcr.io/pablodelarco/roomio`

### 3. **Kubernetes Overlays**

#### Development (`k8s/overlays/development/`)
- ✅ `kustomization.yaml`:
  - Namespace: `staywell-manager-dev` → `roomio-dev`
  - Instance: `staywell-manager-dev` → `roomio-dev`
  - Image: `ghcr.io/pablodelarco/staywell-manager-e301a7db` → `ghcr.io/pablodelarco/roomio`
  - Replica name: `staywell-frontend` → `roomio-frontend`
- ✅ `ingress-patch.yaml`:
  - Ingress name: `staywell-ingress` → `roomio-ingress`
  - Domain: `dev.pablodelarco.com` → `dev.roomio.com`
  - Secret: `dev-staywell-tls-secret` → `dev-roomio-tls-secret`
  - Service: `dev-staywell-frontend-service` → `dev-roomio-frontend-service`

#### Staging (`k8s/overlays/staging/`)
- ✅ `kustomization.yaml`:
  - Namespace: `staywell-manager-staging` → `roomio-staging`
  - Instance: `staywell-manager-staging` → `roomio-staging`
  - Image: `ghcr.io/pablodelarco/staywell-manager-e301a7db` → `ghcr.io/pablodelarco/roomio`
  - Replica name: `staywell-frontend` → `roomio-frontend`
- ✅ `ingress-patch.yaml`:
  - Ingress name: `staywell-ingress` → `roomio-ingress`
  - Domain: `staging.pablodelarco.com` → `staging.roomio.com`
  - Secret: `staging-staywell-tls-secret` → `staging-roomio-tls-secret`
  - Service: `staging-staywell-frontend-service` → `staging-roomio-frontend-service`

#### Production (`k8s/overlays/production/`)
- ✅ `kustomization.yaml`:
  - Namespace: `staywell-manager-prod` → `roomio-prod`
  - Instance: `staywell-manager-prod` → `roomio-prod`
  - Image: `ghcr.io/pablodelarco/staywell-manager-e301a7db` → `ghcr.io/pablodelarco/roomio`
  - Replica name: `staywell-frontend` → `roomio-frontend`
- ✅ `ingress-patch.yaml`:
  - Ingress name: `staywell-ingress` → `roomio-ingress`
  - Domain: `pablodelarco.com` → `www.roomio.com`
  - Secret: `prod-staywell-tls-secret` → `prod-roomio-tls-secret`
  - Service: `prod-staywell-frontend-service` → `prod-roomio-frontend-service`

### 4. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
- ✅ Image name: `staywell-manager-e301a7db` → `roomio`
- ✅ Development deployment:
  - Image: `ghcr.io/pablodelarco/roomio:develop`
  - Namespace: `roomio-dev`
  - URL: `https://dev.roomio.com`
- ✅ Staging deployment:
  - Image: `ghcr.io/pablodelarco/roomio:staging`
  - Namespace: `roomio-staging`
  - URL: `https://staging.roomio.com`
- ✅ Production deployment:
  - Image: `ghcr.io/pablodelarco/roomio:latest`
  - Namespace: `roomio-prod`
  - URL: `https://www.roomio.com`

### 5. **ArgoCD Applications** (`argocd/applications/`)
- ✅ `staywell-dev.yaml`:
  - Application name: `staywell-manager-dev` → `roomio-dev`
  - Labels: `staywell-manager` → `roomio`
  - Namespace: `staywell-manager-dev` → `roomio-dev`
- ✅ `staywell-prod.yaml`:
  - Application name: `staywell-manager-prod` → `roomio-prod`
  - Labels: `staywell-manager` → `roomio`
  - Namespace: `staywell-manager` → `roomio-prod`

---

## 🔧 Required Manual Steps

### 1. **DNS Configuration**
You need to configure DNS records for the new domain `roomio.com`:

#### Cloudflare DNS Records:
```
Type    Name        Content              Proxy   TTL
A       www         <your-server-ip>     ✅      Auto
A       dev         <your-server-ip>     ✅      Auto
A       staging     <your-server-ip>     ✅      Auto
CNAME   @           www.roomio.com       ✅      Auto
```

### 2. **Cloudflare Tunnel Configuration**
Update your Cloudflare Tunnel to point to the new domain:
- Update tunnel configuration to route `www.roomio.com`, `dev.roomio.com`, and `staging.roomio.com`
- Or update your existing tunnel to include the new domains

### 3. **SSL/TLS Certificates**
The cert-manager will automatically request new certificates for:
- `www.roomio.com` (production)
- `dev.roomio.com` (development)
- `staging.roomio.com` (staging)

**Note**: Make sure your Cloudflare API token has permissions for the `roomio.com` zone.

### 4. **Deploy New Kubernetes Resources**

#### Option A: Using kubectl (Manual)
```bash
# Delete old namespaces (CAUTION: This will delete all resources)
kubectl delete namespace staywell-manager-dev
kubectl delete namespace staywell-manager-staging
kubectl delete namespace staywell-manager-prod

# Apply new configurations
kubectl apply -k k8s/overlays/development
kubectl apply -k k8s/overlays/staging
kubectl apply -k k8s/overlays/production
```

#### Option B: Using ArgoCD (Recommended - GitOps)
```bash
# Delete old ArgoCD applications
kubectl delete -f argocd/applications/staywell-dev.yaml
kubectl delete -f argocd/applications/staywell-prod.yaml

# Apply new ArgoCD applications
kubectl apply -f argocd/applications/staywell-dev.yaml
kubectl apply -f argocd/applications/staywell-prod.yaml

# Create staging application (if needed)
# You'll need to create argocd/applications/roomio-staging.yaml
```

### 5. **Update GitHub Container Registry**
The CI/CD pipeline will automatically build and push images to:
- `ghcr.io/pablodelarco/roomio:latest`
- `ghcr.io/pablodelarco/roomio:develop`
- `ghcr.io/pablodelarco/roomio:staging`
- `ghcr.io/pablodelarco/roomio:sha-<commit>`

**First push**: You'll need to trigger the CI/CD pipeline by pushing these changes to GitHub.

### 6. **Delete Old Ingresses**
```bash
# Delete old ingresses that are still using pablodelarco.com
kubectl delete ingress prod-staywell-ingress -n staywell-manager-prod
kubectl delete ingress dev-staywell-ingress -n staywell-manager-dev
kubectl delete ingress staging-staywell-ingress -n staywell-manager-staging
```

---

## 📋 Deployment Checklist

- [ ] Configure DNS records for `roomio.com` in Cloudflare
- [ ] Update Cloudflare Tunnel configuration (if using tunnel)
- [ ] Verify Cloudflare API token has permissions for `roomio.com` zone
- [ ] Commit and push changes to GitHub
- [ ] Wait for CI/CD pipeline to build new Docker images
- [ ] Delete old ArgoCD applications
- [ ] Apply new ArgoCD applications
- [ ] Wait for ArgoCD to sync and deploy
- [ ] Verify cert-manager creates new SSL certificates
- [ ] Test all environments:
  - [ ] https://www.roomio.com (production)
  - [ ] https://dev.roomio.com (development)
  - [ ] https://staging.roomio.com (staging)
- [ ] Delete old namespaces (optional, after verifying new deployment works)

---

## 🐛 Troubleshooting pablodelarco.com 502 Error

**Current Status**: 
- ✅ Pods are running and healthy
- ✅ Service is working internally
- ✅ Traefik is routing correctly internally
- ❌ External access returns 502 Bad Gateway

**Likely Causes**:
1. **Cloudflare Tunnel** might be down or misconfigured
2. **MetalLB LoadBalancer** IP might have changed
3. **Cloudflare DNS** might be pointing to wrong IP

**Quick Fix**:
```bash
# Check Traefik LoadBalancer IP
kubectl get svc traefik -n kube-system

# Verify it matches your Cloudflare Tunnel or DNS A record
# Current expected IP: 192.168.1.237 (MetalLB VIP)
```

---

## 📝 Next Steps

1. **Immediate**: Fix pablodelarco.com by checking Cloudflare Tunnel/DNS configuration
2. **Short-term**: Set up DNS for roomio.com and deploy new configuration
3. **Long-term**: Complete migration and deprecate pablodelarco.com domain

---

**Generated**: 2025-10-08
**Status**: Code changes complete, deployment pending

