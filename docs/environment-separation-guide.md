# Environment Separation Implementation Guide

## New Directory Structure

```
k8s/
├── base/                          # Common base configuration
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── namespace.yaml
│   └── kustomization.yaml
├── overlays/
│   ├── development/               # Development environment
│   │   ├── kustomization.yaml
│   │   ├── deployment-patch.yaml
│   │   ├── service-patch.yaml
│   │   └── ingress-patch.yaml
│   ├── staging/                   # Staging environment
│   │   ├── kustomization.yaml
│   │   ├── deployment-patch.yaml
│   │   └── ingress-patch.yaml
│   └── production/                # Production environment
│       ├── kustomization.yaml
│       ├── deployment-patch.yaml
│       └── ingress-patch.yaml
└── kustomization.yaml             # Legacy (points to dev)
```

## Environment Configurations

### Development Environment
- **Namespace**: `staywell-manager-dev`
- **Replicas**: 1
- **Resources**: Lower (32Mi RAM, 25m CPU)
- **Image Tag**: `develop`
- **Domain**: `dev.pablodelarco.com`
- **Service**: NodePort (30080) for direct access
- **Node**: Pinned to `beelink` for local testing

### Staging Environment  
- **Namespace**: `staywell-manager-staging`
- **Replicas**: 2
- **Resources**: Production-like (64Mi RAM, 50m CPU)
- **Image Tag**: `staging`
- **Domain**: `staging.pablodelarco.com`
- **Service**: ClusterIP
- **Node**: Distributed across available nodes

### Production Environment
- **Namespace**: `staywell-manager-prod`
- **Replicas**: 3 (High Availability)
- **Resources**: Higher (128Mi RAM, 100m CPU)
- **Image Tag**: `latest`
- **Domain**: `pablodelarco.com`
- **Service**: ClusterIP
- **Features**: Pod anti-affinity, rolling updates, TLS

## Deployment Commands

### Development
```bash
# Deploy to development
kubectl apply -k k8s/overlays/development

# Check status
kubectl get all -n staywell-manager-dev

# View logs
kubectl logs -f deployment/dev-staywell-frontend -n staywell-manager-dev
```

### Staging
```bash
# Deploy to staging
kubectl apply -k k8s/overlays/staging

# Check status
kubectl get all -n staywell-manager-staging

# View logs
kubectl logs -f deployment/staging-staywell-frontend -n staywell-manager-staging
```

### Production
```bash
# Deploy to production
kubectl apply -k k8s/overlays/production

# Check status
kubectl get all -n staywell-manager-prod

# View logs
kubectl logs -f deployment/prod-staywell-frontend -n staywell-manager-prod
```

## Migration Steps

### 1. Clean Up Old Resources
```bash
# Remove old single-namespace deployment
kubectl delete -k k8s/ --ignore-not-found=true
kubectl delete namespace staywell-manager-dev --ignore-not-found=true
```

### 2. Deploy New Structure
```bash
# Deploy development environment
kubectl apply -k k8s/overlays/development

# Verify deployment
kubectl get pods -n staywell-manager-dev
```

### 3. Test Access
```bash
# Test development access
curl -H "Host: dev.pablodelarco.com" http://192.168.1.237/
# Or via NodePort
curl http://192.168.1.237:30080/
```

## Key Benefits Achieved

✅ **Environment Isolation**: Separate namespaces prevent conflicts  
✅ **Configuration Management**: Environment-specific settings  
✅ **Scalability**: Different replica counts per environment  
✅ **Security**: Production has enhanced security features  
✅ **Resource Optimization**: Appropriate resources per environment  
✅ **High Availability**: Production uses 3 replicas with anti-affinity  

## Next Steps

1. Update CI/CD pipeline to use new overlay structure
2. Add SSL/TLS certificates for staging and production
3. Implement monitoring for each environment
4. Add secrets management
5. Configure autoscaling for production

## Troubleshooting

### Common Issues
- **Namespace not found**: Ensure you're using the correct overlay
- **Image pull errors**: Check image tags in kustomization.yaml
- **Service not accessible**: Verify ingress configuration and DNS

### Debug Commands
```bash
# Check kustomize output
kubectl kustomize k8s/overlays/development

# Validate before applying
kubectl apply -k k8s/overlays/development --dry-run=client

# Check ingress
kubectl get ingress -n staywell-manager-dev
```
