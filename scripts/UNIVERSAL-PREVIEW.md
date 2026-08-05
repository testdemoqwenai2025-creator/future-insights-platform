# 🚀 AETH-1 Universal Preview System

## **Default Preview Handler - Two Options, Zero Configuration**

---

## 🎯 The Problem We Solved

```
BEFORE (Painful):
❌ Configure localhost ports
❌ Start servers manually  
❌ Deal with port conflicts
❌ No permanent URL
❌ Can't share with clients
❌ Wasted time on setup

AFTER (This System):
✅ One command: node universal-preview.js --token <TOKEN>
✅ Automatic preview deployment
✅ Two options, automatic fallback
✅ Permanent URL from GitHub
✅ Share with anyone instantly
✅ Zero configuration needed
```

---

## 📋 Features

| Feature | Description |
|---------|-------------|
| 🔄 **Automatic Mode** | Tries IDE first, falls back to GitHub |
| 🖥️ **Option A: IDE Preview** | Local server for development |
| 🌐 **Option B: GitHub Pages** | Permanent public URL |
| ⚡ **Zero Config** | No ports, no setup, no clicks |
| 🔁 **Auto Fallback** | If A fails → uses B automatically |
| 📊 **Summary Report** | Shows all available URLs |
| 🎯 **Recommendation** | Suggests best option for use case |

---

## 🚀 Quick Start

### Installation
Already included in your project at `scripts/universal-preview.js`

### Basic Usage

```bash
# Auto mode (recommended)
node scripts/universal-preview.js --token ghp_YOUR_TOKEN

# Force GitHub Pages only
node scripts/universal-preview.js --token ghp_YOUR_TOKEN --mode github

# Get both previews
node scripts/universal-preview.js --token ghp_YOUR_TOKEN --mode both
```

### Output Example

```
████████████████████████████████████████████████████████████
🚀 AETH-1 UNIVERSAL PREVIEW SYSTEM
████████████████████████████████████████████████████████████

📄 Source: ./download/AETH-1-FULL-APPLICATION.html
🎯 Mode: AUTO
⏰ Time: 8/5/2026, 8:15:24 PM

════════════════════════════════════════════════════════════
📺 OPTION A: IDE/Studio Pane Preview
════════════════════════════════════════════════════════════
✅ Local server started
   URL: http://localhost:3000

════════════════════════════════════════════════════════════
🌐 OPTION B: GitHub Pages Preview
════════════════════════════════════════════════════════════
✅ GitHub Pages LIVE!
   URL: https://username.github.io/aeth-1-preview/

════════════════════════════════════════════════════════════
📊 PREVIEW SUMMARY
════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│  Method           Status     URL             │
├─────────────────────────────────────────────┤
│  IDE Preview      ✅       http://localhost:3000 │
│  GitHub Pages     ✅       https://username.github.io/... │
└─────────────────────────────────────────────┘

🎯 RECOMMENDED: https://username.github.io/...
   GitHub Pages - Permanent & Accessible Anywhere

🌐 AVAILABLE PREVIEW URLs:
   1. http://localhost:3000
   2. https://username.github.io/...
```

---

## 🎮 Modes Explained

### `--mode auto` (Default) 
```
Flow: Try IDE → If fails → Use GitHub
Best for: General use, unknown environment
Result: At least one working URL guaranteed
```

### `--mode ide`
```
Flow: Local server only
Best for: Development, debugging
Result: http://localhost:PORT
Note: Only works on your machine
```

### `--mode github`
```
Flow: Deploy to GitHub Pages only
Best for: Sharing with clients, demos
Result: Permanent public URL
Note: Requires GitHub token
```

### `--mode both`
```
Flow: Run both methods regardless
Best for: Maximum availability
Result: Multiple URLs to choose from
Note: Takes longer but gives options
```

---

## 🔧 Integration Examples

### 1. Package.json Script

```json
{
  "scripts": {
    "preview": "node scripts/universal-preview.js --token $GITHUB_TOKEN",
    "preview:github": "node scripts/universal-preview.js --token $GITHUB_TOKEN --mode github",
    "preview:both": "node scripts/universal-preview.js --token $GITHUB_TOKEN --mode both"
  }
}
```

Usage:
```bash
npm run preview          # Auto mode
npm run preview:github   # GitHub only
npm run preview:both     # Both methods
```

### 2. Programmatic Usage

```javascript
const { UniversalPreview } = require('./scripts/universal-preview');

async function showPreview() {
  const preview = new UniversalPreview(process.env.GITHUB_TOKEN, 'your-username');
  
  const results = await preview.autoPreview('./dist/index.html', {
    preferMethod: 'auto',
    githubRepo: 'my-app-preview'
  });
  
  if (results.recommended) {
    console.log(`Preview ready: ${results.recommended}`);
    
    // Send to client, log, etc.
    await notifyClient(results.allUrls);
  }
}

showPreview().catch(console.error);
```

### 3. GitHub Actions Workflow

```yaml
name: 🚀 Auto Preview on Push

on:
  push:
    branches: [main]
    paths: ['**/*.html', 'dist/**']

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 🚀 Generate Preview
        run: |
          node scripts/universal-preview.js \
            --token ${{ secrets.GITHUB_TOKEN }} \
            --mode github \
            --source ./download/AETH-1-FULL-APPLICATION.html
      
      - name: 💬 Comment PR with URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const previewUrl = '${{ steps.preview.outputs.url }}';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 **Preview Ready!**\n\n${previewUrl}`
            });
```

### 4. Next.js API Route

```javascript
// pages/api/preview.js or app/api/preview/route.ts
import { UniversalPreview } from '@/scripts/universal-preview';

export async function POST(req) {
  const { sourcePath } = await req.json();
  
  const preview = new UniversalPreview(
    process.env.GITHUB_TOKEN,
    'your-github-username'
  );
  
  const results = await preview.autoPreview(sourcePath);
  
  return Response.json({
    success: !!results.recommended,
    urls: results.allUrls,
    recommended: results.recommended
  });
}
```

---

## 📁 File Structure

```
your-project/
├── scripts/
│   ├── universal-preview.js       ← Main preview system (NEW!)
│   ├── github-preview-connector.js ← GitHub-specific connector
│   ├── .preview-config.json       ← Default configuration
│   └── GITHUB-PREVIEW-CONNECTOR.md ← Documentation
│
├── download/
│   └── AETH-1-FULL-APPLICATION.html ← Your preview file
│
└── .github/workflows/
    └── deploy-preview.yml         ← CI/CD integration
```

---

## ⚙️ Configuration

Edit `scripts/.preview-config.json`:

```json
{
  "preview": {
    "defaultMode": "auto",  // auto | ide | github | both
    "fallbackBehavior": "automatic",  // automatic | manual | none
    "timeout": 120000  // Max wait time in ms
  },
  "github": {
    "defaultRepoName": "aeth-1-preview"
  },
  "output": {
    "showSummary": true,
    "openBrowser": false  // Set true to auto-open browser
  }
}
```

---

## 🎯 When to Use Each Option

| Scenario | Recommended Mode | Why |
|----------|-----------------|-----|
| **Development** | `ide` | Fast refresh, local debugging |
| **Client Demo** | `github` | Permanent URL, accessible anywhere |
| **Code Review** | `both` | Reviewer can choose |
| **CI/CD Pipeline** | `github` | Automated, no local server needed |
| **Unknown Environment** | `auto` | Guaranteed to work |

---

## ❓ FAQ

### Q: Do I need a GitHub token?
A: Yes, for GitHub Pages mode. For IDE-only mode (`--mode ide`), no token needed.

### Q: Is this really free?
A: Yes! GitHub Pages is free for public repos. No limits.

### Q: How long does it take?
A: IDE mode: ~2 seconds. GitHub mode: ~60 seconds.

### Q: Can I use a custom domain?
A: Yes! Add CNAME file or configure in GitHub repo settings.

### Q: What if both methods fail?
A: Very rare, but system will report errors clearly.

### Q: Can I automate this for every build?
A: Yes! Use the GitHub Actions workflow example above.

---

## 🔒 Security

- ✅ Private code stays private (only HTML preview is public)
- ✅ Token never stored in logs or files
- ✅ Temporary files cleaned up automatically
- ✅ HTTPS-only for GitHub operations

---

## 🐛 Troubleshooting

### "Token not valid"
→ Generate at https://github.com/settings/tokens with `repo` scope

### "Port already in use"
→ System auto-finds available port (no action needed)

### "GitHub Pages taking too long"
→ Normal. Can take up to 5 minutes. Usually ~60 seconds.

### "404 after deployment"
→ DNS propagation. Wait 2-3 minutes.

---

## 🤝 Contributing

This is part of the AETH-1 platform ecosystem.
Suggestions and improvements welcome!

---

## 📜 License

MIT License - Free for personal and commercial use.

---

## 🙏 Acknowledgments

Built based on user feedback about developer experience.
Goal: Match Google AI Studio's preview simplicity while offering GitHub permanence.

**The future of development: Write code → Get preview URL → Share. That's it.**

---

**🚀 Happy Previewing!**
