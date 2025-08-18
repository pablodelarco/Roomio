# 🚀 Step 2: Deployment Infrastructure Setup

## Overview

This guide walks you through setting up the complete deployment infrastructure for your StayWell Manager SaaS application.

## 📋 Prerequisites

✅ **Step 1 Complete**: Container builds and runs successfully
✅ **Docker Working**: Local Docker environment functional
✅ **Code Ready**: All configurations validated and tested

## 🎯 Infrastructure Options

### Option A: Quick Start (Recommended for MVP)
- **GitHub Pages/Vercel**: Static hosting for frontend
- **Supabase**: Managed database and auth
- **GitHub Actions**: CI/CD automation
- **Cost**: ~$0-25/month
- **Setup Time**: 1-2 hours

### Option B: Production SaaS (Recommended for Scale)
- **Kubernetes Cluster**: AWS EKS, GCP GKE, or Azure AKS
- **ArgoCD**: GitOps deployment automation
- **Custom Domain**: Professional branding
- **Monitoring**: Full observability stack
- **Cost**: ~$50-200/month
- **Setup Time**: 4-8 hours

### Option C: Hybrid Approach
- **Start with Option A** for immediate deployment
- **Migrate to Option B** as you scale
- **Best of both worlds**: Fast start + scalable future

## 🚀 Quick Start Deployment (Option A)

### 1. GitHub Repository Setup
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial StayWell Manager setup"

# Create GitHub repository
gh repo create staywell-manager --public
git remote add origin https://github.com/pablodelarco/staywell-manager.git
git push -u origin main
```

### 2. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### 3. Environment Configuration
```bash
# Set environment variables in Vercel dashboard
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 🏗️ Production SaaS Deployment (Option B)

### 1. Cloud Provider Selection

#### AWS EKS (Recommended)
- **Pros**: Mature, extensive services, good pricing
- **Cons**: Complex setup, learning curve
- **Cost**: ~$72/month (cluster) + nodes

#### Google GKE
- **Pros**: Excellent Kubernetes integration, autopilot mode
- **Cons**: Vendor lock-in, pricing complexity
- **Cost**: ~$74/month (cluster) + nodes

#### Azure AKS
- **Pros**: Good Windows integration, competitive pricing
- **Cons**: Smaller ecosystem, fewer regions
- **Cost**: ~$0/month (cluster) + nodes

### 2. Infrastructure as Code

We'll use Terraform for reproducible infrastructure:

```hcl
# terraform/main.tf
provider "aws" {
  region = "us-west-2"
}

module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "staywell-cluster"
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = 2
      max_capacity     = 10
      min_capacity     = 1
      instance_types   = ["t3.medium"]
    }
  }
}
```

### 3. GitOps Repository Structure

```
staywell-gitops/
├── apps/
│   ├── staywell-dev/
│   │   ├── kustomization.yaml
│   │   └── values.yaml
│   └── staywell-prod/
│       ├── kustomization.yaml
│       └── values.yaml
├── infrastructure/
│   ├── argocd/
│   ├── ingress-nginx/
│   └── cert-manager/
└── clusters/
    ├── development/
    └── production/
```

## 🔄 CI/CD Pipeline

Your GitHub Actions workflow will:

1. **Build**: Create optimized production build
2. **Test**: Run unit and integration tests
3. **Security**: Scan for vulnerabilities
4. **Package**: Build and push Docker container
5. **Deploy**: Update GitOps repository
6. **Verify**: Run deployment health checks

## 🌐 Domain and SSL

### Domain Setup
1. **Purchase domain**: Use Namecheap, GoDaddy, or Google Domains
2. **DNS configuration**: Point to your load balancer
3. **SSL certificates**: Automated with cert-manager

### Example DNS Configuration
```
A     staywell.yourdomain.com    → 34.102.136.180
CNAME www.staywell.yourdomain.com → staywell.yourdomain.com
```

## 📊 Monitoring Stack

### Observability Components
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing
- **AlertManager**: Alert routing

### Key Metrics to Monitor
- **Application**: Response time, error rate, throughput
- **Infrastructure**: CPU, memory, disk, network
- **Business**: User registrations, active sessions, revenue

## 💾 Database Configuration

### Supabase Production Setup
1. **Create production project**
2. **Configure connection pooling**
3. **Set up backup strategy**
4. **Enable row-level security**
5. **Configure monitoring**

### Connection Configuration
```typescript
// Production Supabase config
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-my-custom-header': 'staywell-manager' },
  },
})
```

## 🔐 Security Considerations

### Application Security
- **Environment variables**: Never commit secrets
- **HTTPS only**: Force SSL in production
- **CORS configuration**: Restrict origins
- **Rate limiting**: Prevent abuse
- **Input validation**: Sanitize all inputs

### Infrastructure Security
- **Network policies**: Restrict pod communication
- **RBAC**: Least privilege access
- **Image scanning**: Vulnerability detection
- **Secrets management**: Use Kubernetes secrets
- **Backup encryption**: Encrypt at rest

## 📈 Scaling Strategy

### Horizontal Scaling
- **Pod autoscaling**: Based on CPU/memory
- **Cluster autoscaling**: Add nodes automatically
- **Database scaling**: Read replicas for performance

### Vertical Scaling
- **Resource limits**: Right-size containers
- **Node optimization**: Choose appropriate instance types
- **Storage scaling**: Expand volumes as needed

## 💰 Cost Optimization

### Development Environment
- **Spot instances**: 60-90% cost savings
- **Smaller nodes**: t3.small for development
- **Auto-shutdown**: Stop during off-hours

### Production Environment
- **Reserved instances**: 30-60% savings for stable workloads
- **Right-sizing**: Monitor and adjust resources
- **Storage optimization**: Use appropriate storage classes

## 🎯 Next Steps

Choose your deployment path:

1. **Quick Start**: Deploy to Vercel in 30 minutes
2. **Production Setup**: Full Kubernetes infrastructure
3. **Hybrid Approach**: Start simple, scale later

Which option would you like to pursue?
