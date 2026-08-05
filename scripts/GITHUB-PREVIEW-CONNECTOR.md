# 🔌 AETH-1 GitHub Preview Connector

**One-command deployment tool for instant GitHub Pages previews**

## 🎯 Purpose

This connector bridges the gap between "code on GitHub" and "live preview" - exactly what modern developers need until IDEs have built-in preview like Google AI Studio.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚀 **One-Command Deploy** | Single command to deploy preview |
| 🌐 **GitHub Pages Hosting** | Free, permanent, always accessible |
| 🔒 **Separate Repos** | Private code + Public preview |
| ♻️ **Auto-Updates** | Re-run to update existing preview |
| ⚡ **Fast** | ~60 seconds from command to live URL |
| 💰 **Free** | No costs whatsoever |

---

## 📋 Prerequisites

1. **GitHub Personal Access Token** with `repo` scope
   - Generate at: https://github.com/settings/tokens
   - Required permissions: `repo` (full control)

2. **Node.js** (v14+)
   - Most systems have this pre-installed

3. **HTML File** to preview
   - Can be any static HTML file

---

## 🚀 Quick Start

### Basic Usage

```bash
# Navigate to your project
cd /path/to/your/project

# Run the connector
node scripts/github-preview-connector.js --token ghp_YOUR_TOKEN_HERE
```

### With Options

```bash
# Custom source file
node scripts/github-preview-connector.js \
  --token ghp_YOUR_TOKEN \
  --source ./dist/index.html

# Custom preview repo name
node scripts/github-preview-connector.js \
  --token ghp_YOUR_TOKEN \
  --repo my-awesome-app-preview
```

### Programmatic Usage

```javascript
const { GitHubPreviewConnector } = require('./scripts/github-preview-connector');

const connector = new GitHubPreviewConnector(token, 'your-github-username');

const result = await connector.deploy('./path/to/index.html', {
  previewRepoName: 'my-app-preview',
  mainRepoName: 'my-private-repo'
});

console.log(result.previewUrl); // https://username.github.io/my-app-preview/
```

---

## 📁 What It Creates

### Repository Structure

```
Your GitHub Account
├── 🔒 future-insights-platform (PRIVATE)
│   ├── src/
│   ├── scripts/
│   │   └── github-preview-connector.js ← This tool
│   └── ... all your source code
│
└── 🌐 aeth-1-preview (PUBLIC) [Auto-created]
    ├── index.html          ← Your preview
    └── README.md           ← Auto-generated
```

### Output URL Format

```
https://<USERNAME>.github.io/<PREVIEW_REPO_NAME>/

Example: https://testdemoqwenai2025-creator.github.io/aeth-1-preview/
```

---

## 🔄 Workflow Integration

### Option 1: Manual (For Quick Previews)

```bash
# After making changes to your app:
npm run build        # or whatever builds your HTML
node scripts/github-preview-connector.js --token $GITHUB_TOKEN
# → Preview auto-updates in ~60 seconds!
```

### Option 2: GitHub Actions (Automated)

Add to `.github/workflows/deploy-preview.yml`:

```yaml
name: 🚀 Auto-Deploy Preview

on:
  push:
    branches: [main]
    paths: ['download/**', 'dist/**']

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 🚀 Deploy Preview
        run: |
          node scripts/github-preview-connector.js \
            --token ${{ secrets.GITHUB_TOKEN }} \
            --source ./download/AETH-1-FULL-APPLICATION.html
```

### Option 3: Package.json Script

```json
{
  "scripts": {
    "preview": "node scripts/github-preview-connector.js --token $GITHUB_TOKEN",
    "preview:custom": "node scripts/github-preview-connector.js --token $GITHUB_TOKEN --source ./dist/index.html"
  }
}
```

Then simply:
```bash
npm run preview
```

---

## 🎯 Two Preview Options for Clients

When delivering projects to clients, offer them:

### Option A: GitHub Pages (This Connector)
| Pro | Con |
|-----|-----|
| ✅ Free forever | ⚠️ Takes ~60s to update |
| ✅ Permanent URL | ⚠️ Public repo needed |
| ✅ No signup required | |
| ✅ Works everywhere | |

**Best for:** Production demos, portfolios, public showcases

### Option B: StackBlitz / CodeSandbox
| Pro | Con |
|-----|-----|
| ✅ Full IDE experience | ❌ Requires their login |
| ✅ Instant updates | ⚠️ Session-based |
| ✅ Editable code | |

**Best for:** Interactive demos, code reviews, tutorials

---

## 🔧 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT FLOW                          │
│                                                             │
│  1. INPUT                                                   │
│     • GitHub Token                                          │
│     • HTML file path                                        │
│                                                             │
│         ↓                                                  │
│                                                             │
│  2. CREATE PUBLIC REPO (if not exists)                      │
│     • Named: aeth-1-preview (or custom)                    │
│     • Description: Auto-generated preview                   │
│                                                             │
│         ↓                                                  │
│                                                             │
│  3. DEPLOY HTML                                             │
│     • Copy HTML as index.html                               │
│     • Add README with context                              │
│     • Git push to public repo                              │
│                                                             │
│         ↓                                                  │
│                                                             │
│  4. ENABLE GITHUB PAGES                                    │
│     • Configure Pages settings                             │
│     • Set source to main branch                            │
│                                                             │
│         ↓                                                  │
│                                                             │
│  5. WAIT FOR DEPLOYMENT (~30-60s)                           │
│     • Poll GitHub API                                      │
│     • Check deployment status                              │
│                                                             │
│         ↓                                                  │
│                                                             │
│  6. OUTPUT                                                  │
│     • Preview URL returned                                 │
│     • Summary printed to console                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ❓ FAQ

### Q: Is this really free?
A: Yes! GitHub Pages is free for public repositories. No limits, no credit card.

### Q: How long does the preview stay up?
A: Forever (or until you delete the repo). It's permanent hosting.

### Q: Can I use a custom domain?
A: Yes! Add CNAME file or configure in repo Settings → Pages.

### Q: Is my private code exposed?
A: No! Only the HTML preview is public. Your source code stays private.

### Q: How do I update the preview?
A: Just re-run the same command after updating your HTML file.

### Q: Can I preview multiple projects?
A: Yes! Use different `--repo` names for each project.

---

## 🐛 Troubleshooting

### "Token not valid"
→ Generate new token at https://github.com/settings/tokens with `repo` scope

### "Repo already exists"
→ Normal! The connector will update it automatically

### "Deployment taking too long"
→ GitHub Pages can take up to 5 minutes. Usually 30-60 seconds.

### "404 Not Found" after deployment
→ DNS propagation. Wait 2-3 minutes and try again.

---

## 📄 License

MIT License - Free to use, modify, distribute.

---

## 🤝 Contributing

This is part of the AETH-1 platform. Contributions welcome!

---

## 🙏 Acknowledgments

Built based on user feedback about needing instant previews without complex setup.
Bridges the gap until IDEs have built-in preview like Google AI Studio.

---

**🚀 Happy Previewing!**
