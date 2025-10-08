# SSL/TLS & Security Setup Guide

## 🎯 Overview

This guide walks you through setting up automatic SSL/TLS certificates using cert-manager with Let's Encrypt and Cloudflare DNS-01 challenge for your multi-environment StayWell Manager deployment.

## 🔧 Prerequisites

1. **Cloudflare Account** with your domain (`pablodelarco.com`)
2. **Cloudflare API Token** with DNS edit permissions
3. **cert-manager** installed in your Kubernetes cluster ✅
4. **Traefik** ingress controller ✅

## 📋 Step 1: Get Cloudflare API Token

### Create API Token in Cloudflare Dashboard:

1. **Go to**: [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. **Click**: "Create Token"
3. **Use Template**: "Custom token"
4. **Configure**:
   - **Token name**: `cert-manager-dns01`
   - **Permissions**:
     - `Zone:DNS:Edit`
     - `Zone:Zone:Read`
   - **Zone Resources**:
     - `Include: Specific zone: pablodelarco.com`
5. **Click**: "Continue to summary"
6. **Click**: "Create Token"
7. **Copy the token** (you won't see it again!)

## 📋 Step 2: Apply Cloudflare Secret

Replace `YOUR_CLOUDFLARE_API_TOKEN_HERE` in the secret:

```bash
# Edit the secret file
nano k8s/base/cloudflare-secret.yaml

# Replace YOUR_CLOUDFLARE_API_TOKEN_HERE with your actual token
# Then apply it
kubectl apply -f k8s/base/cloudflare-secret.yaml
```

## 📋 Step 3: Update ClusterIssuers

```bash
# Apply the updated ClusterIssuers with DNS-01 challenge
kubectl apply -f k8s/base/clusterissuer.yaml
```

## 📋 Step 4: Clean Up Failed Certificates

```bash
# Delete the failed HTTP-01 certificates
kubectl delete certificates -A --all

# Delete failed certificate requests
kubectl delete certificaterequests -A --all

# Delete failed challenges
kubectl delete challenges -A --all
```

## 📋 Step 5: Redeploy Environments

```bash
# Redeploy all environments with new TLS configuration
kubectl apply -k k8s/overlays/development
kubectl apply -k k8s/overlays/staging  
kubectl apply -k k8s/overlays/production
```

## 🧪 Step 6: Verify Certificate Status

```bash
# Check certificate status
kubectl get certificates -A

# Check certificate details
kubectl describe certificate prod-staywell-tls -n staywell-manager-prod

# Check certificate requests
kubectl get certificaterequests -A

# Check challenges (should be empty after success)
kubectl get challenges -A
```

## 🎯 Expected Results

After successful deployment, you should see:

```bash
NAMESPACE                  NAME                   READY   SECRET                        AGE
staywell-manager-dev       dev-staywell-tls       True    dev-staywell-tls-secret       2m
staywell-manager-prod      prod-staywell-tls      True    prod-staywell-tls-secret      2m
staywell-manager-staging   staging-staywell-tls   True    staging-staywell-tls-secret   2m
```

## 🔒 Security Features Added

### 1. **Automatic SSL/TLS Certificates**
- ✅ Let's Encrypt certificates for all environments
- ✅ Automatic renewal (90 days)
- ✅ DNS-01 challenge (works with Cloudflare Tunnel)

### 2. **Enhanced Security Headers**
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options, X-Content-Type-Options
- ✅ XSS Protection, Referrer Policy

### 3. **Network Security**
- ✅ Network policies for pod-to-pod communication
- ✅ Ingress/egress traffic control
- ✅ Rate limiting middleware

### 4. **TLS Configuration**
- ✅ HTTPS redirect (HTTP → HTTPS)
- ✅ TLS termination at ingress
- ✅ Secure cipher suites

## 🚨 Troubleshooting

### Certificate Not Ready
```bash
# Check certificate events
kubectl describe certificate prod-staywell-tls -n staywell-manager-prod

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

### DNS Challenge Failing
```bash
# Verify Cloudflare API token
kubectl get secret cloudflare-api-token-secret -n cert-manager -o yaml

# Check ClusterIssuer status
kubectl describe clusterissuer letsencrypt-prod
```

### Ingress Issues
```bash
# Check ingress configuration
kubectl get ingress -A
kubectl describe ingress prod-staywell-ingress -n staywell-manager-prod
```

## 🎊 Next Steps

After SSL/TLS is working:
1. **Test HTTPS access** to all environments
2. **Verify certificate details** in browser
3. **Set up monitoring** for certificate expiration
4. **Configure backup certificates** if needed
