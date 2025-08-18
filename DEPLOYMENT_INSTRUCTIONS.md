# 🚀 StayWell Manager - GitOps Deployment Instructions

## 📋 Prerequisites Complete ✅

- ✅ **K3s Cluster**: 2-node homelab cluster running
- ✅ **ArgoCD**: Installed and accessible at http://192.168.1.238
- ✅ **Traefik**: LoadBalancer at 192.168.1.237
- ✅ **Docker**: Container builds successfully
- ✅ **Code**: GitOps configuration ready

## 🎯 Next Steps: Complete GitOps Setup

### Step 1: Create GitHub Repository

1. **Go to**: https://github.com/new
2. **Repository name**: `staywell-manager`
3. **Description**: `Modern property management SaaS deployed on homelab K3s with GitOps`
4. **Visibility**: Public ✅
5. **Initialize**: Don't initialize (we have code ready)
6. **Click**: "Create repository"

### Step 2: Push Code to GitHub

```bash
# Push main branch
git push -u origin main

# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

### Step 3: Deploy ArgoCD Applications

```bash
# Deploy ArgoCD applications to your cluster
kubectl apply -f argocd/applications/

# Check ArgoCD applications
kubectl get applications -n argocd
```

### Step 4: Access ArgoCD UI

1. **Open**: http://192.168.1.238
2. **Login**: 
   - Username: `admin`
   - Password: Get with `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

### Step 5: Verify Deployment

```bash
# Check if applications are synced
kubectl get pods -n staywell-manager-dev

# Check application status
kubectl get applications -n argocd -o wide
```

## 🔄 How GitOps Will Work

### Automatic Deployment Flow:

1. **Code Change** → Push to GitHub
2. **GitHub Actions** → Build & push container to GHCR
3. **ArgoCD** → Detects changes and syncs to K3s
4. **K3s** → Deploys updated application

### Branch Strategy:

- **`develop` branch** → Deploys to `staywell-manager-dev` namespace
- **`main` branch** → Deploys to `staywell-manager` namespace (production)

### Container Registry:

- **Registry**: GitHub Container Registry (GHCR)
- **Image**: `ghcr.io/pablodelarco/staywell-manager:latest`
- **Access**: Public (no authentication needed)

## 🌐 Application Access

After deployment, your application will be available at:

### Development Environment:
- **Namespace**: `staywell-manager-dev`
- **URL**: http://dev.staywell.local (configure in your router/DNS)
- **LoadBalancer**: 192.168.1.237

### Production Environment:
- **Namespace**: `staywell-manager`
- **URL**: http://staywell.local
- **LoadBalancer**: 192.168.1.237

## 🔧 Troubleshooting

### Check Pod Status:
```bash
kubectl get pods -n staywell-manager-dev
kubectl logs -f deployment/dev-staywell-frontend -n staywell-manager-dev
```

### Check ArgoCD Sync:
```bash
kubectl get applications -n argocd
kubectl describe application staywell-dev -n argocd
```

### Manual Sync (if needed):
```bash
# Via CLI
argocd app sync staywell-dev

# Via UI
# Go to ArgoCD UI → Applications → staywell-dev → Sync
```

### Check Image Pull:
```bash
# Verify image is accessible
docker pull ghcr.io/pablodelarco/staywell-manager:latest
```

## 📊 Monitoring

### ArgoCD Dashboard:
- **URL**: http://192.168.1.238
- **Applications**: Monitor sync status, health, and deployment history

### Kubernetes Dashboard:
```bash
# Port forward to access
kubectl port-forward -n argocd svc/argocd-server 8080:443
# Access: https://localhost:8080
```

### Application Logs:
```bash
# Development
kubectl logs -f deployment/dev-staywell-frontend -n staywell-manager-dev

# Production
kubectl logs -f deployment/prod-staywell-frontend -n staywell-manager
```

## 🎉 Success Criteria

Your GitOps setup is successful when:

1. ✅ **GitHub repository** created and code pushed
2. ✅ **GitHub Actions** builds container successfully
3. ✅ **ArgoCD applications** deployed and synced
4. ✅ **Pods running** in both dev and prod namespaces
5. ✅ **Application accessible** via LoadBalancer IP
6. ✅ **Automatic sync** working on code changes

## 🚀 Next Steps After GitOps

Once GitOps is working:

1. **Custom Domain**: Configure DNS for staywell.local
2. **SSL Certificates**: Set up Let's Encrypt with cert-manager
3. **Monitoring**: Add Prometheus/Grafana
4. **Backup Strategy**: Database and persistent volume backups
5. **Alerting**: Set up alerts for application and infrastructure

## 💡 Pro Tips

- **Test changes** on develop branch first
- **Use ArgoCD UI** to monitor deployments
- **Check GitHub Actions** for build status
- **Monitor resource usage** in your homelab
- **Keep secrets** in Kubernetes secrets, not in Git

---

**Your homelab GitOps setup is production-ready!** 🏠✨
