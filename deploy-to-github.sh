#!/bin/bash
# AETH-1 Deployment Script
# This script helps you push to GitHub and deploy to Vercel

set -e

echo "🚀 AETH-1 Deployment Helper"
echo "============================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.ts" ]; then
    echo "❌ Please run this script from the AETH-1 project root."
    exit 1
fi

echo "📁 Project directory: $(pwd)"
echo ""

# Show current status
echo "📊 Current Git Status:"
echo "----------------------"
git status --short | head -20
echo ""

# Show remote info
echo "🌐 Git Remote:"
echo "--------------"
git remote -v
echo ""

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes."
    read -p "Would you like to commit them? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        read -p "Enter commit message: " COMMIT_MSG
        git commit -m "${COMMIT_MSG:-feat: update}"
        echo "✅ Changes committed."
    fi
else
    echo "✅ No uncommitted changes."
fi

echo ""
echo "🔑 Authentication Required"
echo "--------------------------"
echo "To push to GitHub, you need one of these:"
echo ""
echo "Option 1: Use GitHub CLI (gh)"
echo "  1. Install: https://cli.github.com/"
echo "  2. Run: gh auth login"
echo "  3. Then run this script again"
echo ""
echo "Option 2: Use Personal Access Token"
echo "  1. Go to: GitHub → Settings → Developer Settings → Personal Access Tokens"
echo "  2. Generate a token with 'repo' scope"
echo "  3. Run: git remote set-url origin https://<TOKEN>@github.com/aeth-1/future-insights-platform.git"
echo "  4. Then run this script again"
echo ""
echo "Option 3: Use SSH Key"
echo "  1. Generate key: ssh-keygen -t ed25519 -C 'your@email.com'"
echo "  2. Add to GitHub: https://github.com/settings/keys"
echo "  3. Change URL: git remote set-url origin git@github.com:aeth-1/future-insights-platform.git"
echo "  4. Then run this script again"
echo ""

read -p "Try pushing to GitHub now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Pushing to GitHub..."
    echo "---------------------"
    
    if git push origin main 2>&1; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🌐 Next Steps for Vercel Deployment:"
        echo "------------------------------------"
        echo "1. Go to: https://vercel.com/new"
        echo "2. Import repository: aeth-1/future-insights-platform"
        echo "3. Configure:"
        echo "   - Framework Preset: Next.js"
        echo "   - Root Directory: ./"
        echo "   - Build Command: npm run build (or bun run build)"
        echo "   - Output Directory: .next"
        echo "4. Add Environment Variables (in Vercel dashboard):"
        echo "   - JWT_SECRET: your-jwt-secret-here"
        echo "   - DATABASE_URL: your-database-url-here"
        echo "5. Click Deploy!"
        echo ""
        echo "🎉 Your app will be live at: https://aeth-1.vercel.app"
        echo ""
        echo "📌 To make repo private after pushing:"
        echo "   Go to GitHub repo → Settings → Danger Zone → Change visibility → Private"
    else
        echo ""
        echo "❌ Push failed. Please authenticate first using one of the options above."
        exit 1
    fi
else
    echo ""
    echo "⏭️  Skipped push. You can manually run: git push origin main"
fi

echo ""
echo "✨ Done! Thank you for using AETH-1 ✨"
