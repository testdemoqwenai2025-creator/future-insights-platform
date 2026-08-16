#!/bin/bash
# GitHub Pages Deployment Script for DemoSciCMP
# Builds and deploys the Next.js app to GitHub Pages

set -e

echo "🚀 DemoSciCMP GitHub Pages Deployment"
echo "======================================"

# Configuration
REPO_URL="https://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@github.com/testdemoqwenai2025-creator/future-insights-platform.git"
BUILD_DIR="out"
DEPLOY_BRANCH="gh-pages"

echo "📁 Step 1: Cleaning previous builds..."
rm -rf .next $BUILD_DIR node_modules/.cache
echo "✅ Cleaned"

echo "📦 Step 2: Installing dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -5
echo "✅ Dependencies installed"

echo "🔨 Step 3: Building static export..."
npm run build 2>&1 | tail -20
echo "✅ Build complete"

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build failed - no output directory found"
    exit 1
fi

echo "📂 Step 4: Preparing deployment..."
cd $BUILD_DIR
git init
git checkout -b $DEPLOY_BRANCH
git add -A
git commit -m "Deploy DemoSciCMP $(date +%Y-%m-%d\ %H:%M:%S)"
echo "✅ Ready to deploy"

echo "🌐 Step 5: Pushing to GitHub Pages..."
git force push $REPO_URL $DEPLOY_BRANCH:gh-pages --force 2>&1 | tail -10
echo ""

echo "======================================"
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Live URL: https://testdemoqwenai2025-creator.github.io/DemoSciCMP/"
echo ""
echo "Template URLs:"
echo "  • Gallery: https://testdemoqwenai2025-creator.github.io/DemoSciCMP/#/templates"
echo "  • BLAST:   https://testdemoqwenai2025-creator.github.io/DemoSciCMP/#/templates/bioinformatics/blast"
echo "  • ML:      https://testdemoqwenai2025-creator.github.io/DemoSciCMP/#/templates/ml/training"
echo "======================================"

cd ..
