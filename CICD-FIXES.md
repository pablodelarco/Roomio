# CI/CD Pipeline Fixes

## 🐛 Issues Identified

1. **Docker Build Failure**: Invalid tag format `ghcr.io/pablodelarco/staywell-manager-e301a7db:-808688c`
2. **Invalid Reference Format**: Repository name with UUID causing tag issues
3. **Trivy Security Scan Failing**: Due to build failure and incorrect image reference
4. **ArgoCD Not Syncing**: No automated image tag updates in Kubernetes manifests

## 🔧 Fixes Applied

### 1. Fixed Docker Image Naming
**File**: `.github/workflows/ci-cd.yml`
- Changed `IMAGE_NAME` from `${{ github.repository }}` to `pablodelarco/staywell-manager`
- This removes the problematic UUID from the image name

### 2. Improved Docker Metadata Generation
**File**: `.github/workflows/ci-cd.yml`
- Added `format=short` to SHA-based tags
- Added `flavor: latest=auto` for better tag management
- Fixed tag generation to prevent invalid characters

### 3. Fixed Trivy Security Scan
**File**: `.github/workflows/ci-cd.yml`
- Updated image reference to use proper format: `${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.ref_name }}-${{ github.sha }}`
- This ensures Trivy scans the correct image that was actually built

### 4. Added Automated Image Tag Updates
**File**: `.github/workflows/ci-cd.yml`
- Added step to automatically update Kubernetes manifest files with new image tags
- Updates `k8s/overlays/development/kustomization.yaml` for develop branch
- Updates `k8s/overlays/production/kustomization.yaml` for main branch
- Commits changes back to repository with `[skip ci]` to prevent infinite loops

### 5. Updated Kubernetes Manifests
**Files**: 
- `k8s/overlays/development/kustomization.yaml`
- `k8s/overlays/production/kustomization.yaml`
- `k8s/base/kustomization.yaml`

- Changed from generic `latest` tags to branch-specific tags
- Development uses `develop` tag
- Production uses `main` tag
- Cleaned up formatting issues

### 6. Created Test Script
**File**: `scripts/test-build.sh`
- Added local Docker build test script
- Tests health check and main page accessibility
- Helps validate builds before pushing

## 🚀 Expected Results

After these fixes:

1. **CI/CD Pipeline** will build successfully with proper Docker tags
2. **Security Scanning** will work correctly with valid image references
3. **ArgoCD Applications** will automatically sync when new images are built
4. **Deployments** will use the correct image tags for each environment

## 🔄 GitOps Flow

The updated flow:
1. Developer pushes to `develop` or `main` branch
2. GitHub Actions builds and pushes Docker image with proper tags
3. GitHub Actions updates Kubernetes manifests with new image tags
4. ArgoCD detects manifest changes and syncs to cluster
5. Kubernetes performs rolling update with new image

## 🧪 Testing

To test the fixes:

1. **Local Build Test**:
   ```bash
   ./scripts/test-build.sh
   ```

2. **Push to Develop Branch**:
   ```bash
   git checkout develop
   git push origin develop
   ```

3. **Check ArgoCD**:
   - Monitor ArgoCD UI for automatic sync
   - Verify new image tags in deployment

## 📝 Notes

- All image references now use consistent naming: `ghcr.io/pablodelarco/staywell-manager`
- Tags follow pattern: `<branch>-<short-sha>` for commits, `<branch>` for latest
- ArgoCD applications are configured for automatic sync (dev) and manual sync (prod)
- Security scanning runs on every build with proper image references
