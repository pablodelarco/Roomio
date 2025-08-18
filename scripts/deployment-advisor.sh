#!/bin/bash

# StayWell Manager - Deployment Advisor
# This script helps you choose the best deployment strategy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_question() { echo -e "${PURPLE}[QUESTION]${NC} $1"; }
log_option() { echo -e "${CYAN}[OPTION]${NC} $1"; }

echo "🚀 StayWell Manager - Deployment Advisor"
echo "========================================"
echo ""

# Gather requirements
log_info "Let's determine the best deployment strategy for your needs..."
echo ""

# Question 1: Timeline
log_question "1. What's your deployment timeline?"
echo "   a) I need it deployed TODAY (within hours)"
echo "   b) I have a few days to set up properly"
echo "   c) I want the best long-term solution (1-2 weeks)"
echo ""
read -p "Enter your choice (a/b/c): " timeline

# Question 2: Budget
log_question "2. What's your monthly budget for hosting?"
echo "   a) Free or minimal cost (<$10/month)"
echo "   b) Small budget ($10-50/month)"
echo "   c) Professional budget ($50-200/month)"
echo "   d) Enterprise budget (>$200/month)"
echo ""
read -p "Enter your choice (a/b/c/d): " budget

# Question 3: Scale expectations
log_question "3. How many users do you expect initially?"
echo "   a) Just me and a few testers (<10 users)"
echo "   b) Small user base (10-100 users)"
echo "   c) Growing user base (100-1000 users)"
echo "   d) Large scale (1000+ users)"
echo ""
read -p "Enter your choice (a/b/c/d): " scale

# Question 4: Technical expertise
log_question "4. What's your Kubernetes/DevOps experience?"
echo "   a) Beginner (I prefer simple solutions)"
echo "   b) Intermediate (I can follow detailed guides)"
echo "   c) Advanced (I'm comfortable with complex setups)"
echo ""
read -p "Enter your choice (a/b/c): " expertise

# Question 5: Business goals
log_question "5. What's your primary goal?"
echo "   a) Quick MVP to validate the idea"
echo "   b) Professional demo for investors/customers"
echo "   c) Production-ready SaaS business"
echo ""
read -p "Enter your choice (a/b/c): " goal

echo ""
log_info "Analyzing your requirements..."
sleep 2

# Calculate recommendation score
quick_score=0
production_score=0
hybrid_score=0

# Timeline scoring
case $timeline in
    a) quick_score=$((quick_score + 3)); hybrid_score=$((hybrid_score + 2)) ;;
    b) hybrid_score=$((hybrid_score + 3)); production_score=$((production_score + 1)) ;;
    c) production_score=$((production_score + 3)); hybrid_score=$((hybrid_score + 1)) ;;
esac

# Budget scoring
case $budget in
    a) quick_score=$((quick_score + 3)) ;;
    b) quick_score=$((quick_score + 2)); hybrid_score=$((hybrid_score + 2)) ;;
    c) hybrid_score=$((hybrid_score + 2)); production_score=$((production_score + 2)) ;;
    d) production_score=$((production_score + 3)) ;;
esac

# Scale scoring
case $scale in
    a) quick_score=$((quick_score + 2)) ;;
    b) quick_score=$((quick_score + 1)); hybrid_score=$((hybrid_score + 2)) ;;
    c) hybrid_score=$((hybrid_score + 2)); production_score=$((production_score + 1)) ;;
    d) production_score=$((production_score + 3)) ;;
esac

# Expertise scoring
case $expertise in
    a) quick_score=$((quick_score + 2)) ;;
    b) hybrid_score=$((hybrid_score + 2)) ;;
    c) production_score=$((production_score + 2)) ;;
esac

# Goal scoring
case $goal in
    a) quick_score=$((quick_score + 3)) ;;
    b) hybrid_score=$((hybrid_score + 3)) ;;
    c) production_score=$((production_score + 3)) ;;
esac

# Determine recommendation
if [ $quick_score -ge $hybrid_score ] && [ $quick_score -ge $production_score ]; then
    recommendation="quick"
elif [ $hybrid_score -ge $production_score ]; then
    recommendation="hybrid"
else
    recommendation="production"
fi

echo ""
echo "🎯 RECOMMENDATION ANALYSIS"
echo "=========================="
echo ""

case $recommendation in
    "quick")
        log_success "🚀 RECOMMENDED: Quick Start Deployment"
        echo ""
        echo "✅ Perfect for your needs because:"
        echo "   • Fast deployment (30 minutes)"
        echo "   • Minimal cost ($0-10/month)"
        echo "   • Simple to manage"
        echo "   • Great for MVP validation"
        echo ""
        echo "📋 Deployment Plan:"
        echo "   1. Deploy to Vercel (5 minutes)"
        echo "   2. Configure Supabase (10 minutes)"
        echo "   3. Set up custom domain (15 minutes)"
        echo "   4. Configure GitHub Actions (optional)"
        echo ""
        echo "💰 Estimated Cost: $0-10/month"
        echo "⏱️  Setup Time: 30 minutes"
        echo "👥 Supports: Up to 100 concurrent users"
        ;;
    
    "hybrid")
        log_success "🔄 RECOMMENDED: Hybrid Approach"
        echo ""
        echo "✅ Perfect for your needs because:"
        echo "   • Start simple, scale later"
        echo "   • Moderate cost ($10-50/month)"
        echo "   • Professional appearance"
        echo "   • Easy migration path"
        echo ""
        echo "📋 Deployment Plan:"
        echo "   Phase 1: Quick deployment (30 minutes)"
        echo "   Phase 2: Add monitoring (1 hour)"
        echo "   Phase 3: Migrate to Kubernetes (when needed)"
        echo ""
        echo "💰 Estimated Cost: $10-50/month"
        echo "⏱️  Setup Time: 2-4 hours"
        echo "👥 Supports: Up to 1000 concurrent users"
        ;;
    
    "production")
        log_success "🏗️ RECOMMENDED: Production Infrastructure"
        echo ""
        echo "✅ Perfect for your needs because:"
        echo "   • Enterprise-grade scalability"
        echo "   • Full observability"
        echo "   • Professional operations"
        echo "   • Future-proof architecture"
        echo ""
        echo "📋 Deployment Plan:"
        echo "   1. Set up Kubernetes cluster (2 hours)"
        echo "   2. Configure GitOps with ArgoCD (1 hour)"
        echo "   3. Set up monitoring stack (2 hours)"
        echo "   4. Configure domain and SSL (1 hour)"
        echo ""
        echo "💰 Estimated Cost: $50-200/month"
        echo "⏱️  Setup Time: 6-8 hours"
        echo "👥 Supports: 10,000+ concurrent users"
        ;;
esac

echo ""
echo "🎯 NEXT STEPS"
echo "============="
echo ""

case $recommendation in
    "quick")
        echo "Ready to deploy in 30 minutes? Here's what we'll do:"
        echo ""
        echo "1. 🔗 Create GitHub repository"
        echo "2. 🚀 Deploy to Vercel"
        echo "3. 🗄️  Configure Supabase"
        echo "4. 🌐 Set up custom domain"
        echo ""
        echo "Would you like to start the Quick Start deployment? (y/n)"
        ;;
    
    "hybrid")
        echo "Ready for the Hybrid approach? Here's the plan:"
        echo ""
        echo "Phase 1 (Today):"
        echo "1. 🔗 Create GitHub repository"
        echo "2. 🚀 Deploy to Vercel"
        echo "3. 🗄️  Configure Supabase"
        echo ""
        echo "Phase 2 (This week):"
        echo "4. 📊 Add monitoring"
        echo "5. 🌐 Custom domain"
        echo "6. 🔒 Enhanced security"
        echo ""
        echo "Would you like to start Phase 1? (y/n)"
        ;;
    
    "production")
        echo "Ready for Production infrastructure? Here's the plan:"
        echo ""
        echo "1. ☁️  Choose cloud provider (AWS/GCP/Azure)"
        echo "2. 🏗️  Set up Kubernetes cluster"
        echo "3. 🔄 Configure GitOps"
        echo "4. 📊 Set up monitoring"
        echo "5. 🌐 Configure domain and SSL"
        echo ""
        echo "Would you like to start with cloud provider selection? (y/n)"
        ;;
esac

echo ""
read -p "Continue with recommended approach? (y/n): " continue_choice

if [ "$continue_choice" = "y" ] || [ "$continue_choice" = "Y" ]; then
    echo ""
    log_success "Great! Let's get started with your $recommendation deployment!"
    echo ""
    echo "📖 Detailed guides available in:"
    echo "   • docs/STEP2_DEPLOYMENT_GUIDE.md"
    echo "   • scripts/deploy-${recommendation}.sh (will be created)"
    echo ""
    echo "🚀 Ready to begin deployment setup!"
else
    echo ""
    log_info "No problem! You can run this advisor again anytime:"
    echo "   ./scripts/deployment-advisor.sh"
    echo ""
    echo "📖 All deployment options are documented in:"
    echo "   docs/STEP2_DEPLOYMENT_GUIDE.md"
fi

echo ""
echo "💡 Pro Tip: You can always start with a simpler approach and upgrade later!"
echo "   The infrastructure is designed to be migration-friendly."
