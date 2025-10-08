# Deployment Workflow

## Overview

This project uses a GitOps workflow with three environments:
- **Development** (`develop` branch) → https://dev.roomiorentals.com
- **Staging** (`staging` branch) → https://staging.roomiorentals.com  
- **Production** (`main` branch) → https://roomiorentals.com

## How It Works

1. **Lovable/Developers** push code to `develop` branch
2. **GitHub Actions CI/CD** automatically:
   - Builds Docker image with SHA-based tag (e.g., `sha-abc1234`)
   - Pushes image to `ghcr.io/pablodelarco/roomio:sha-abc1234`
   - Updates `k8s/overlays/development/kustomization.yaml` with new tag
   - Commits back to `develop` branch with `[skip ci]`
3. **ArgoCD** detects the change and deploys to dev environment

## Promoting to Staging

When you're ready to promote development to staging:

```bash
# Simply merge develop into staging - CI/CD will automatically sync the image tag!
git checkout staging
git pull origin staging
git merge develop --no-edit
git push origin staging
git checkout develop
```

**What happens automatically:**
1. GitHub Actions detects the merge commit
2. Extracts the image tag from `k8s/overlays/development/kustomization.yaml`
3. Updates `k8s/overlays/staging/kustomization.yaml` with the same tag
4. Commits and pushes the change with `[skip ci]`
5. ArgoCD deploys the same Docker image to staging within 3 minutes

## Promoting to Production

When staging is tested and ready for production:

```bash
# Simply merge staging into main - CI/CD will automatically sync the image tag!
git checkout main
git pull origin main
git merge staging --no-edit
git push origin main
git checkout develop
```

**What happens automatically:**
1. GitHub Actions detects the merge commit
2. Extracts the image tag from `k8s/overlays/staging/kustomization.yaml`
3. Updates `k8s/overlays/production/kustomization.yaml` with the same tag
4. Commits and pushes the change with `[skip ci]`
5. ArgoCD deploys to production within 3 minutes

## Important Notes

### How Automatic Image Tag Syncing Works

Each environment has its own `kustomization.yaml` file with its own image tag:
- `k8s/overlays/development/kustomization.yaml` → Updated when pushing to `develop`
- `k8s/overlays/staging/kustomization.yaml` → Updated when pushing to `staging` OR when merging from `develop`
- `k8s/overlays/production/kustomization.yaml` → Updated when pushing to `main` OR when merging from `staging`

**The CI/CD pipeline automatically detects merge commits** and syncs image tags:
- When merging `develop` → `staging`: Copies the image tag from development to staging
- When merging `staging` → `main`: Copies the image tag from staging to production

This ensures that when you promote code between environments, you're deploying the exact same Docker image.

### Verifying Deployments

Check ArgoCD status:
```bash
kubectl get applications -n argocd | grep roomio
```

Check all domains are working:
```bash
curl -I https://dev.roomiorentals.com
curl -I https://staging.roomiorentals.com
curl -I https://roomiorentals.com
```

### Rollback

If you need to rollback to a previous version:

```bash
# Find the previous image tag
git log --oneline k8s/overlays/production/kustomization.yaml

# Manually edit the kustomization.yaml and set the desired tag
# Then commit and push
git checkout main
# Edit k8s/overlays/production/kustomization.yaml manually
git add k8s/overlays/production/kustomization.yaml
git commit -m "Rollback to previous version"
git push origin main
```

## Troubleshooting

### Staging shows different content than development after merge

This means the image tags weren't synced. Run:
```bash
./scripts/sync-image-tags.sh development staging
git add k8s/overlays/staging/kustomization.yaml
git commit -m "Sync image tags"
git push origin staging
```

### ArgoCD shows "OutOfSync"

Wait 3 minutes for auto-sync, or manually sync:
```bash
kubectl patch application roomio-staging -n argocd --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"HEAD"}}}'
```

### Git conflict markers in kustomization.yaml

This happens when merging branches with different image tags. Always resolve by keeping the source branch's tag:
```bash
# For develop → staging merge, keep develop's tag
./scripts/sync-image-tags.sh development staging
git add k8s/overlays/staging/kustomization.yaml
git rebase --continue
```

