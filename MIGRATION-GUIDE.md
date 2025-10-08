# 🔄 Migration Guide: StayWell → Roomio

## 📋 Overview

This guide explains how to migrate from the old StayWell namespaces to the new Roomio namespaces using GitOps with ArgoCD.

---

## 🎯 Current Situation

### **Local Repository:**
- Path: `/home/pablo/staywell-manager-e301a7db-1`
- Contains: Full k8s overlays structure (base + development/staging/production)
- All "StayWell" references have been changed to "Roomio"
- Domains updated to roomiorentals.com

### **GitHub Repository:**
- URL: `https://github.com/pablodelarco/Roomio`
- Contains: Simple k8s manifests (no overlays structure)
- **Needs to be updated** with the local repository content

### **Kubernetes Cluster:**
- **Old namespaces** (still running):
  - `staywell-manager-dev` ✅ Working
  - `staywell-manager-staging` ✅ Working  
  - `staywell-manager-prod` ✅ Working

- **New namespaces** (deployed manually):
  - `roomio-dev` ✅ Running
  - `roomio-staging` ✅ Running
  - `roomio-prod` ✅ Running

---

## 🚀 Migration Steps

### **Step 1: Push Local Changes to GitHub Roomio Repository**

```bash
cd /home/pablo/staywell-manager-e301a7db-1

# Add the Roomio repository as a remote
git remote add roomio https://github.com/pablodelarco/Roomio.git

# Push to all branches
git push roomio main --force
git push roomio develop --force
git push roomio staging --force

# Or if you want to keep history:
git push roomio HEAD:main
git push roomio develop:develop
git push roomio staging:staging
```

**Note:** This will update the GitHub Roomio repository with all the k8s overlays structure on all branches.

---

### **Step 2: Update ArgoCD Applications**

The ArgoCD application files are already created in `argocd/applications/`:
- `roomio-dev.yaml`
- `roomio-prod.yaml`
- `roomio-staging.yaml`

These files point to:
- Repository: `https://github.com/pablodelarco/Roomio`
- Branches:
  - Dev: `develop` → `k8s/overlays/development`
  - Staging: `staging` → `k8s/overlays/staging`
  - Production: `main` → `k8s/overlays/production`

**Apply the ArgoCD applications:**

```bash
kubectl apply -f argocd/applications/roomio-dev.yaml
kubectl apply -f argocd/applications/roomio-prod.yaml
kubectl apply -f argocd/applications/roomio-staging.yaml
```

---

### **Step 3: Wait for ArgoCD to Sync**

ArgoCD will automatically detect the changes and sync the deployments.

**Check sync status:**

```bash
# Watch ArgoCD applications
kubectl get applications -n argocd -w

# Check specific application status
kubectl describe application roomio-prod -n argocd
```

**Expected output:**
```
NAME             SYNC STATUS   HEALTH STATUS
roomio-dev       Synced        Healthy
roomio-prod      Synced        Healthy
roomio-staging   Synced        Healthy
```

---

### **Step 4: Create Simple Ingresses (Without Complex Annotations)**

The complex Traefik annotations in the overlay ingress patches cause routing issues. We need to create simple ingresses:

**Production:**
```bash
kubectl delete ingress prod-roomio-ingress -n roomio-prod

cat << 'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prod-roomio-ingress
  namespace: roomio-prod
spec:
  ingressClassName: traefik
  rules:
  - host: roomiorentals.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: prod-roomio-frontend-service
            port:
              number: 80
EOF
```

**Development:**
```bash
kubectl delete ingress dev-roomio-ingress -n roomio-dev

cat << 'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dev-roomio-ingress
  namespace: roomio-dev
spec:
  ingressClassName: traefik
  rules:
  - host: dev.roomiorentals.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dev-roomio-frontend-service
            port:
              number: 80
EOF
```

**Staging:**
```bash
kubectl delete ingress staging-roomio-ingress -n roomio-staging

cat << 'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: staging-roomio-ingress
  namespace: roomio-staging
spec:
  ingressClassName: traefik
  rules:
  - host: staging.roomiorentals.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: staging-roomio-frontend-service
            port:
              number: 80
EOF
```

---

### **Step 5: Verify New Roomio Deployments**

```bash
# Check all pods
kubectl get pods -n roomio-dev
kubectl get pods -n roomio-staging
kubectl get pods -n roomio-prod

# Check services
kubectl get svc -n roomio-dev
kubectl get svc -n roomio-staging
kubectl get svc -n roomio-prod

# Check ingresses
kubectl get ingress -n roomio-dev
kubectl get ingress -n roomio-staging
kubectl get ingress -n roomio-prod

# Test internal routing
curl -H "Host: roomiorentals.com" http://10.42.0.217:8000
curl -H "Host: dev.roomiorentals.com" http://10.42.0.217:8000
curl -H "Host: staging.roomiorentals.com" http://10.42.0.217:8000
```

---

### **Step 6: Configure DNS (See DNS-SETUP-GUIDE.md)**

Follow the instructions in `DNS-SETUP-GUIDE.md` to configure Cloudflare DNS records.

---

### **Step 7: Delete Old StayWell Namespaces (Optional)**

**⚠️ Only do this after confirming the new Roomio deployments are working!**

```bash
# Delete old ArgoCD application
kubectl delete application staywell-dev -n argocd

# Delete old namespaces
kubectl delete namespace staywell-manager-dev
kubectl delete namespace staywell-manager-staging
kubectl delete namespace staywell-manager-prod
```

---

## 📊 Migration Checklist

### **Pre-Migration:**
- [ ] All code changes committed locally
- [ ] ArgoCD application files created
- [ ] DNS records planned (see DNS-SETUP-GUIDE.md)

### **Migration:**
- [ ] Push local repository to GitHub Roomio repo
- [ ] Apply ArgoCD applications
- [ ] Wait for ArgoCD to sync
- [ ] Create simple ingresses
- [ ] Verify all pods are running
- [ ] Configure DNS in Cloudflare
- [ ] Test all domains (roomiorentals.com, dev, staging)

### **Post-Migration:**
- [ ] Confirm all environments accessible from internet
- [ ] Delete old StayWell namespaces
- [ ] Delete old ArgoCD application (staywell-dev)
- [ ] Update documentation

---

## 🔧 Troubleshooting

### **ArgoCD Application Shows "ComparisonError":**

**Problem:** `app path does not exist`

**Solution:** Make sure you've pushed the local repository to GitHub Roomio repo first.

```bash
git push roomio main --force
```

### **Pods Not Starting:**

**Problem:** `ErrImagePull` or `ImagePullBackOff`

**Solution:** Check the image name in kustomization files. Should be:
```yaml
images:
- name: ghcr.io/pablodelarco/staywell-manager-e301a7db
  newTag: latest
```

### **Ingress Not Working:**

**Problem:** 404 or 502 errors

**Solution:** Use simple ingress without complex Traefik annotations (see Step 4).

---

## 📝 Notes

- **GitOps Approach:** All changes should be made in Git, then ArgoCD will automatically sync
- **Manual kubectl apply:** Only use for testing or emergency fixes
- **Ingress Annotations:** Complex Traefik annotations cause routing issues - keep it simple
- **Docker Image:** Continue using `ghcr.io/pablodelarco/staywell-manager-e301a7db` until you rebuild with new name

---

**Generated:** 2025-10-08  
**Status:** Ready for migration

