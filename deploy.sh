#!/bin/bash

# AETH-1 Platform - Deployment Script
# Run this locally to push to GitHub and deploy to Vercel

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     ⚡ AETH-1 Platform - Deployment Script               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Check prerequisites
echo -e "${BLUE}[1/5] Checking prerequisites...${NC}"

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}[2/5] Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Build project
echo -e "${BLUE}[3/5] Building project...${NC}"
npm run build
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Step 4: Git operations
echo -e "${BLUE}[4/5] Preparing for push...${NC}"

# Add remote if not exists
if ! git remote get-url origin &> /dev/null; then
    echo "Enter your GitHub repository URL:"
    read repo_url
    git remote add origin "$repo_url"
fi

# Stage all files (respecting .gitignore)
git add -A

# Show status
echo ""
echo "Files to commit:"
git diff --cached --stat | tail -5
echo ""

# Commit
git commit -m "feat: AETH-1 Platform complete with backend & frontend

- Full Next.js 16 application with 5 preview pages
- Backend API layer (auth, users, papers, data, storage, status)
- Middleware (authentication, rate limiting, CORS, error handling)
- Admin dashboard interface
- Unit and integration tests
- CI/CD pipeline configuration
- Complete documentation"

# Push
echo ""
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push -u origin main
echo -e "${GREEN}✓ Pushed to GitHub${NC}"
echo ""

# Step 5: Deploy to Vercel
echo -e "${BLUE}[5/5] Deploying to Vercel...${NC}"
echo ""
echo "Choose deployment option:"
echo "  1) Vercel CLI (automatic)"
echo "  2) Manual (open browser)"
read -p "Option [1]: " deploy_option

case $deploy_option in
    2|"")
        echo ""
        echo "Opening Vercel deployment page..."
        open "https://vercel.com/new/clone?repository-url=$(git remote get-url origin)"
        ;;
    1)
        if command -n vercel &> /dev/null; then
            vercel --prod --yes
        else
            echo "Installing Vercel CLI..."
            npm i -g vercel
            vercel --prod --yes
        fi
        ;;
esac

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     ✅ DEPLOYMENT COMPLETE!                            ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                        ║"
echo "║  Your application should be live at:                  ║"
echo "║  https://aeth-1.vercel.app (or your custom domain)    ║"
echo "║                                                        ║"
echo "║  To make repository private:                          ║"
echo "║  Go to GitHub → Settings → Change visibility → Private║"
echo "║                                                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
