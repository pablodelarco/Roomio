# 🌐 DNS Setup Guide for roomiorentals.com

## ✅ Server Configuration Complete

### **Cloudflare Tunnel Updated:**
- ✅ Added `roomiorentals.com` → `http://192.168.1.233:80`
- ✅ Added `dev.roomiorentals.com` → `http://192.168.1.233:80`
- ✅ Added `staging.roomiorentals.com` → `http://192.168.1.233:80`
- ✅ Cloudflared service restarted successfully
- ✅ Tunnel ID: `027fdb10-9c89-46d7-80d2-da2ffc2799c2`

---

## 🎯 DNS Records to Add in Cloudflare

### **Step 1: Add CNAME Records (Main Domains)**

#### **Production Domain:**
```
Type: CNAME
Name: roomiorentals.com (or @)
Target: 027fdb10-9c89-46d7-80d2-da2ffc2799c2.cfargotunnel.com
Proxy status: ✅ Proxied (Orange cloud)
TTL: Auto
```

#### **Development Domain:**
```
Type: CNAME
Name: dev
Target: 027fdb10-9c89-46d7-80d2-da2ffc2799c2.cfargotunnel.com
Proxy status: ✅ Proxied (Orange cloud)
TTL: Auto
```

#### **Staging Domain:**
```
Type: CNAME
Name: staging
Target: 027fdb10-9c89-46d7-80d2-da2ffc2799c2.cfargotunnel.com
Proxy status: ✅ Proxied (Orange cloud)
TTL: Auto
```

---

### **Step 2: Add CAA Records (SSL Certificate Authorization)**

These records authorize certificate authorities to issue SSL certificates for your domain.

#### **CAA Records for Let's Encrypt:**
```
Type: CAA
Name: roomiorentals.com (or @)
Tag: Only allow wildcards
CA domain name: letsencrypt.org
Flags: 0
TTL: Auto
```

```
Type: CAA
Name: roomiorentals.com (or @)
Tag: Only allow specific hostnames
CA domain name: letsencrypt.org
Flags: 0
TTL: Auto
```

#### **CAA Records for DigiCert:**
```
Type: CAA
Name: roomiorentals.com (or @)
Tag: Only allow wildcards
CA domain name: digicert.com
Flags: 0
TTL: Auto
```

```
Type: CAA
Name: roomiorentals.com (or @)
Tag: Only allow specific hostnames
CA domain name: digicert.com
Flags: 0
TTL: Auto
```

#### **CAA Records for Comodo:**
```
Type: CAA
Name: roomiorentals.com (or @)
Tag: Only allow wildcards
CA domain name: comodoca.com
Flags: 0
TTL: Auto
```

```
Type: CAA
Name: roomiorentals.com (or @)
Tag: Only allow specific hostnames
CA domain name: comodoca.com
Flags: 0
TTL: Auto
```

#### **CAA Records for GlobalSign:**
```
Type: CAA
Name: roomiorentals.com (or @)
Tag: Only allow wildcards
CA domain name: globalsign.com
Flags: 0
TTL: Auto
```

```
Type: CAA
Name: roomiorentals.com (or @)
Tag: Only allow specific hostnames
CA domain name: globalsign.com
Flags: 0
TTL: Auto
```

**Note:** All CAA records should have **Proxy status: DNS only** (Grey cloud)

---

## 📋 Quick Setup Checklist

### **In Cloudflare Dashboard:**

1. **Go to DNS settings for roomiorentals.com**

2. **Add CNAME records** (3 records):
   - [ ] `@` or `roomiorentals.com` → `027fdb10-9c89-46d7-80d2-da2ffc2799c2.cfargotunnel.com` (Proxied)
   - [ ] `dev` → `027fdb10-9c89-46d7-80d2-da2ffc2799c2.cfargotunnel.com` (Proxied)
   - [ ] `staging` → `027fdb10-9c89-46d7-80d2-da2ffc2799c2.cfargotunnel.com` (Proxied)

3. **Add CAA records** (8 records total):
   - [ ] letsencrypt.org (issue)
   - [ ] letsencrypt.org (issuewild)
   - [ ] digicert.com (issue)
   - [ ] digicert.com (issuewild)
   - [ ] comodoca.com (issue)
   - [ ] comodoca.com (issuewild)
   - [ ] globalsign.com (issue)
   - [ ] globalsign.com (issuewild)

4. **Configure SSL/TLS settings:**
   - [ ] Go to SSL/TLS → Overview
   - [ ] Set encryption mode to **"Full"** or **"Full (strict)"**

5. **Wait for DNS propagation** (1-5 minutes)

6. **Test the domains:**
   ```bash
   curl -I https://roomiorentals.com
   curl -I https://dev.roomiorentals.com
   curl -I https://staging.roomiorentals.com
   ```

---

## 🔍 Verification Commands

### **Check DNS Propagation:**
```bash
# Check if CNAME is set
nslookup roomiorentals.com

# Check if dev subdomain is set
nslookup dev.roomiorentals.com

# Check if staging subdomain is set
nslookup staging.roomiorentals.com
```

### **Test Website Access:**
```bash
# Test production
curl -I https://roomiorentals.com

# Test development
curl -I https://dev.roomiorentals.com

# Test staging
curl -I https://staging.roomiorentals.com
```

### **Check Cloudflare Tunnel Status:**
```bash
sudo systemctl status cloudflared
```

---

## 🐛 Troubleshooting

### **If domains don't work after DNS setup:**

1. **Check Cloudflare Tunnel is running:**
   ```bash
   sudo systemctl status cloudflared
   ```

2. **Check tunnel logs:**
   ```bash
   sudo journalctl -u cloudflared -f
   ```

3. **Verify DNS records in Cloudflare:**
   - Make sure CNAME records are **Proxied** (Orange cloud)
   - Make sure CAA records are **DNS only** (Grey cloud)

4. **Check SSL/TLS mode:**
   - Should be "Full" or "Full (strict)"
   - NOT "Flexible"

5. **Test internal routing:**
   ```bash
   curl -H "Host: roomiorentals.com" http://192.168.1.233
   # Should return 200 OK
   ```

6. **Check Kubernetes ingress:**
   ```bash
   kubectl get ingress -n roomio-prod
   # Should show roomiorentals.com
   ```

---

## 📊 Current Configuration Summary

### **Cloudflare Tunnel:**
- **Tunnel Name:** staywell-homelab
- **Tunnel ID:** 027fdb10-9c89-46d7-80d2-da2ffc2799c2
- **Target:** `027fdb10-9c89-46d7-80d2-da2ffc2799c2.cfargotunnel.com`

### **Routing:**
```
roomiorentals.com → Cloudflare Tunnel → 192.168.1.233:80 → Traefik → roomio-prod pods
dev.roomiorentals.com → Cloudflare Tunnel → 192.168.1.233:80 → Traefik → roomio-dev pods
staging.roomiorentals.com → Cloudflare Tunnel → 192.168.1.233:80 → Traefik → roomio-staging pods
```

### **Kubernetes:**
- **Namespace:** roomio-prod
- **Pods:** 3 replicas running
- **Service:** prod-roomio-frontend-service (ClusterIP)
- **Ingress:** prod-roomio-ingress (roomiorentals.com)
- **LoadBalancer IP:** 192.168.1.233 (MetalLB)

---

## 🎯 Next Steps After DNS Setup

1. **Deploy development environment:**
   ```bash
   kubectl apply -k k8s/overlays/development
   ```

2. **Deploy staging environment:**
   ```bash
   kubectl apply -k k8s/overlays/staging
   ```

3. **Create simple ingresses for dev and staging** (without complex annotations)

4. **Clean up old StayWell namespaces** (optional):
   ```bash
   kubectl delete namespace staywell-manager-prod
   kubectl delete namespace staywell-manager-dev
   kubectl delete namespace staywell-manager-staging
   ```

---

**Generated:** 2025-10-08  
**Status:** Server configured, waiting for DNS setup in Cloudflare

