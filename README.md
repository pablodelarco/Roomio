# StayWell Manager – Homelab SaaS Platform

**StayWell Manager** is a modern property management SaaS deployed on a self-hosted K3s cluster with a complete GitOps-powered CI/CD pipeline. Built as a side project to demonstrate scalable, automated deployments using cloud-native best practices.

---

##  Architecture & Tech Stack

- **Frontend:** React + TypeScript + Vite  
- **Backend:** Supabase (Database + Authentication)  
- **Containerization:** Docker with nginx (non-root user)  
- **Kubernetes Orchestration:** K3s  
- **GitOps:** ArgoCD  
- **CI/CD:** GitHub Actions (test → build → scan → deploy)  
- **Registry:** GitHub Container Registry (GHCR)  
- **Security:** Trivy container scanning in CI  
- **Networking & Ingress:** Traefik, Tailscale for remote access, Cert-Manager for SSL  
- **Infrastructure:** 2-node homelab cluster (beelink + worker); GitOps overlays for `development` and `production`

---

##  CI/CD Workflow

1. **Push to `develop` branch** → Pipeline runs, builds container images, runs security scans, updates dev overlay → ArgoCD syncs to the development environment.  
2. **Push to `main` branch** → Same pipeline, followed by ArgoCD deployment to production cluster.  
3. **GitOps at the core**: Ensures deployments remain transparent, auditable, and easily revertible.

---

##  Why It Matters

- Demonstrates hands-on experience with **end-to-end DevOps and GitOps workflows**—from local development to production-grade orchestration.  
- Transparent, Git-based deployment ensures **traceability and reproducibility**.  
- Security is integrated early through **automated container scanning with Trivy**.  
- Fully autonomous delivery pipeline—ideal for continuous iteration and fast-feature delivery in SaaS.

---

##  Setup & Development

```bash
# Local development:
npm install
npm run dev

# Test suite:
npm test

# Production build:
npm run build:prod

# Build container locally:
docker build -t staywell-manager .

# GitOps manual triggers:
kubectl apply -k k8s/overlays/development
kubectl apply -k k8s/overlays/production
