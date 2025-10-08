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
# 1. Merge develop into staging
git checkout staging
git pull origin staging
git merge develop --no-edit

# 2. Sync the image tag from development to staging
./scripts/sync-image-tags.sh development staging

# 3. Commit and push
git add k8s/overlays/staging/kustomization.yaml
git commit -m "Promote development to staging"
git push origin staging

# 4. Return to develop
git checkout develop
```

ArgoCD will automatically deploy the same Docker image to staging within 3 minutes.

## Promoting to Production

When staging is tested and ready for production:

```bash
# 1. Merge staging into main
git checkout main
git pull origin main
git merge staging --no-edit

# 2. Sync the image tag from staging to production
./scripts/sync-image-tags.sh staging production

# 3. Commit and push
git add k8s/overlays/production/kustomization.yaml
git commit -m "Promote staging to production"
git push origin main

# 4. Return to develop
git checkout develop
```

ArgoCD will automatically deploy to production within 3 minutes.

## Important Notes

### Why We Need to Sync Image Tags

Each environment has its own `kustomization.yaml` file with its own image tag:
- `k8s/overlays/development/kustomization.yaml` → Updated when pushing to `develop`
- `k8s/overlays/staging/kustomization.yaml` → Updated when pushing to `staging`
- `k8s/overlays/production/kustomization.yaml` → Updated when pushing to `main`

When you merge branches, **the code merges but the image tags don't automatically sync**. That's why we use the `sync-image-tags.sh` script to copy the image tag from the source environment to the target environment.

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

# Manually update the tag
./scripts/sync-image-tags.sh <source-overlay> production

# Or manually edit and set a specific tag
# Then commit and push
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

