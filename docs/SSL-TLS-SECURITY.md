# 🔒 SSL/TLS & Security Implementation

## Overview

This document describes the comprehensive SSL/TLS and security implementation for the StayWell Manager platform, featuring automated certificate management, modern TLS configuration, and enterprise-grade security practices.

## 🏗️ Architecture

### Certificate Management
- **cert-manager**: Automated certificate lifecycle management
- **DNS-01 Challenge**: Cloudflare DNS validation for reliable certificate issuance
- **Let's Encrypt**: Production and staging certificate authorities
- **Automatic Renewal**: Certificates renewed 30 days before expiration

### TLS Configuration
- **Modern TLS**: TLS 1.3 preferred with fallback to TLS 1.2
- **Strong Cipher Suites**: AEAD ciphers with perfect forward secrecy
- **HSTS**: HTTP Strict Transport Security with preload
- **Security Headers**: Comprehensive security header implementation

## 🔧 Components

### 1. ClusterIssuers
```yaml
# Production issuer with DNS-01 challenge
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: pablodelarco1@gmail.com
    solvers:
    - dns01:
        cloudflare:
          apiTokenSecretRef:
            name: cloudflare-api-token-secret
            key: api-token
```

### 2. Certificate Configuration
- **Renewal**: 30 days before expiration (720h)
- **Duration**: 90 days validity (2160h)
- **Algorithm**: RSA 2048-bit with automatic rotation
- **Subject**: Organizational details included

### 3. Security Headers
- **X-Frame-Options**: SAMEORIGIN
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **HSTS**: max-age=31536000; includeSubDomains; preload
- **CSP**: Comprehensive Content Security Policy

### 4. TLS Options
- **Modern**: TLS 1.3 only with strongest ciphers
- **Intermediate**: TLS 1.2+ with broad compatibility
- **Default**: Secure baseline configuration

## 🚀 Setup Instructions

### 1. Cloudflare API Token
Create a Cloudflare API token with the following permissions:
- Zone:Zone:Read
- Zone:DNS:Edit
- Include: All zones

Update the secret:
```bash
kubectl patch secret cloudflare-api-token-secret -n cert-manager \
  --type='json' \
  -p='[{"op": "replace", "path": "/data/api-token", "value": "'$(echo -n "YOUR_TOKEN" | base64)'"}]'
```

### 2. Apply Configuration
```bash
# Apply base configuration
kubectl apply -k k8s/base/

# Apply environment-specific configuration
kubectl apply -k k8s/overlays/production/
```

### 3. Verify Certificates
```bash
# Check certificate status
kubectl get certificates -A

# Check certificate details
kubectl describe certificate prod-staywell-tls -n staywell-manager-prod
```

## 📊 Monitoring

### Certificate Monitoring
- **CronJob**: Runs every 6 hours
- **Checks**: Certificate status, expiration, challenges
- **Alerts**: Failed renewals and expired certificates

### Manual Monitoring Commands
```bash
# Check all certificates
kubectl get certificates -A

# Check cluster issuers
kubectl get clusterissuers

# Check challenges
kubectl get challenges -A

# Run monitoring script manually
kubectl create job --from=cronjob/cert-monitoring cert-check-manual
```

## 🔧 Troubleshooting

### Common Issues

1. **Certificate Not Ready**
   ```bash
   kubectl describe certificate <name> -n <namespace>
   kubectl logs -n cert-manager deployment/cert-manager
   ```

2. **DNS Challenge Failures**
   - Verify Cloudflare API token permissions
   - Check DNS propagation: `dig TXT _acme-challenge.pablodelarco.com`

3. **TLS Handshake Errors**
   - Verify certificate installation
   - Check TLS configuration in Traefik

### Recovery Procedures

1. **Force Certificate Renewal**
   ```bash
   kubectl delete certificate <name> -n <namespace>
   kubectl apply -k k8s/overlays/production/
   ```

2. **Reset Certificate State**
   ```bash
   kubectl delete challenges --all -n <namespace>
   kubectl delete certificaterequests --all -n <namespace>
   ```

## 🔒 Security Best Practices

### Implemented
- ✅ DNS-01 challenge (more secure than HTTP-01)
- ✅ Automatic certificate rotation
- ✅ Strong TLS configuration
- ✅ Comprehensive security headers
- ✅ Network policies
- ✅ Rate limiting

### Recommendations
- 🔄 Regular security audits
- 📊 Certificate expiration monitoring
- 🔍 TLS configuration testing
- 📝 Security incident response plan

## 📈 Performance Impact

### Optimizations
- **TLS 1.3**: Reduced handshake latency
- **OCSP Stapling**: Faster certificate validation
- **Session Resumption**: Improved connection reuse
- **HTTP/2**: Multiplexed connections

### Monitoring
- Connection establishment time
- TLS handshake duration
- Certificate validation performance
- Security header overhead

## 🎯 Future Enhancements

- [ ] Certificate Transparency monitoring
- [ ] Advanced threat protection
- [ ] WAF integration
- [ ] DDoS protection
- [ ] Security scanning automation
