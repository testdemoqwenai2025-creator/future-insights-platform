#!/usr/bin/env node

/**
 * 🚀 AETH-1 Universal Preview System
 * 
 * Default preview handler - offers two options automatically:
 * 
 * OPTION A: IDE/Studio Pane Preview (Built-in, like Google AI Studio)
 * OPTION B: GitHub Pages Connector (Automatic fallback)
 * 
 * NO localhost/port config needed
 * NO manual browser clicks
 * NO downloads required
 * 
 * If Option A fails → Automatically uses Option B
 * 
 * Usage:
 *   node universal-preview.js --token <TOKEN> --source <HTML_FILE>
 *   
 * Or import as module:
 *   const { UniversalPreview } = require('./universal-preview');
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors
const c = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m', 
  blue: '\x1b[34m', red: '\x1b[31m', cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

/**
 * Universal Preview Class - Handles both preview methods
 */
class UniversalPreview {
  constructor(token, username) {
    this.token = token;
    this.username = username;
    this.results = {
      optionA: null, // IDE/Studio Preview
      optionB: null, // GitHub Pages
      finalUrl: null,
      methodUsed: null
    };
  }

  /**
   * OPTION A: IDE/Studio Built-in Preview
   * Attempts to serve locally and return URL
   */
  async tryIdePreview(sourcePath) {
    log('\n' + '═'.repeat(60), 'cyan');
    log('📺 OPTION A: IDE/Studio Pane Preview', 'cyan');
    log('═'.repeat(60), 'cyan');
    
    const port = this.findAvailablePort(3000);
    const server = this.createStaticServer(sourcePath, port);
    
    return new Promise((resolve) => {
      server.listen(port, () => {
        log(`✅ Local server started`, 'green');
        log(`   URL: http://localhost:${port}`, 'blue');
        
        // Verify it's working
        setTimeout(() => {
          fetch(`http://localhost:${port}`)
            .then(res => {
              if (res.status === 200) {
                log(`✅ IDE Preview ready!`, 'green');
                this.results.optionA = `http://localhost:${port}`;
                this.results.methodUsed = 'ide';
                this.results.finalUrl = `http://localhost:${port}`;
                resolve({
                  success: true,
                  url: `http://localhost:${port}`,
                  method: 'ide-preview',
                  note: 'Local IDE preview - requires browser on same machine'
                });
              } else {
                log(`⚠️ Server responded with ${res.status}`, 'yellow');
                resolve({ success: false, error: 'Server error' });
              }
            })
            .catch(err => {
              log(`❌ IDE Preview failed: ${err.message}`, 'red');
              resolve({ success: false, error: err.message });
            })
            .finally(() => {
              // Keep server running for IDE use
              this._server = server;
              this._serverPort = port;
            });
        }, 1000);
      });
      
      server.on('error', (err) => {
        log(`❌ Could not start local server: ${err.message}`, 'red');
        resolve({ success: false, error: err.message });
      });
    });
  }

  /**
   * OPTION B: GitHub Pages Connector (Fallback/Automatic)
   */
  async tryGitHubPreview(sourcePath, repoName = 'aeth-1-preview') {
    log('\n' + '═'.repeat(60), 'cyan');
    log('🌐 OPTION B: GitHub Pages Preview', 'cyan');
    log('═'.repeat(60), 'cyan');
    
    try {
      // Step 1: Ensure public repo exists
      log('\n📁 Checking/creating preview repository...', 'yellow');
      const repoUrl = await this.ensureRepo(repoName);
      
      // Step 2: Deploy HTML
      log('🚀 Deploying to GitHub...', 'yellow');
      await this.deployToGitHub(sourcePath, repoName);
      
      // Step 3: Enable/wait for Pages
      log('⏳ Configuring GitHub Pages...', 'yellow');
      const pagesUrl = await this.enablePages(repoName);
      
      // Step 4: Wait for deployment
      log('⏳ Waiting for deployment (~30-60s)...', 'yellow');
      const liveUrl = await this.waitForDeployment(repoName);
      
      log(`\n✅ GitHub Pages LIVE!`, 'green');
      log(`   URL: ${liveUrl}`, 'blue');
      
      this.results.optionB = liveUrl;
      if (!this.results.finalUrl) {
        this.results.finalUrl = liveUrl;
        this.results.methodUsed = 'github';
      }
      
      return {
        success: true,
        url: liveUrl,
        method: 'github-pages',
        note: 'Permanent URL - accessible from anywhere'
      };
      
    } catch (error) {
      log(`❌ GitHub Preview failed: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }

  /**
   * AUTOMATIC MODE: Try A first, fall back to B
   */
  async autoPreview(sourcePath, options = {}) {
    const { 
      preferMethod = 'auto', // 'auto', 'ide', 'github', 'both'
      githubRepo = 'aeth-1-preview',
      timeout = 120000
    } = options;

    console.log('\n' + '█'.repeat(60));
    console.log(c.bold + '🚀 AETH-1 UNIVERSAL PREVIEW SYSTEM' + c.reset);
    console.log('█'.repeat(60));
    console.log(`\n📄 Source: ${sourcePath}`);
    console.log(`🎯 Mode: ${preferMethod.toUpperCase()}`);
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);

    const results = {
      ide: null,
      github: null,
      recommended: null,
      allUrls: []
    };

    // Try based on preference
    if (preferMethod === 'ide' || preferMethod === 'auto') {
      results.ide = await this.tryIdePreview(sourcePath);
    }

    if (preferMethod === 'github' || preferMethod === 'auto' || preferMethod === 'both') {
      results.github = await this.tryGitHubPreview(sourcePath, githubRepo);
    }

    if (preferMethod === 'both') {
      // Try both regardless
      if (!results.ide) results.ide = await this.tryIdePreview(sourcePath);
      if (!results.github) results.github = await this.tryGitHubPreview(sourcePath, githubRepo);
    }

    // Determine recommendation
    if (results.github?.success) {
      results.recommended = results.github.url;
      results.recommendedReason = 'GitHub Pages - Permanent & Accessible Anywhere';
    } else if (results.ide?.success) {
      results.recommended = results.ide.url;
      results.recommendedReason = 'IDE Preview - Local Only';
    } else {
      results.recommended = null;
      results.recommendedError = 'Both methods failed';
    }

    // Collect all successful URLs
    if (results.ide?.success) results.allUrls.push(results.ide.url);
    if (results.github?.success) results.allUrls.push(results.github.url);

    // Print summary
    this.printSummary(results);

    return results;
  }

  /**
   * Print formatted summary
   */
  printSummary(results) {
    console.log('\n' + '═'.repeat(60));
    console.log(c.bold + '📊 PREVIEW SUMMARY' + c.reset);
    console.log('═'.repeat(60));

    console.log('\n┌─────────────────────────────────────────────┐');
    console.log('│  Method           Status     URL             │');
    console.log('├─────────────────────────────────────────────┤');

    // IDE Result
    const ideStatus = results.ide?.success ? '✅' : '❌';
    const ideUrl = results.ide?.url || 'N/A';
    console.log(`│  IDE Preview      ${ideStatus}       ${ideUrl.padEnd(15)} │`);

    // GitHub Result  
    const ghStatus = results.github?.success ? '✅' : '❌';
    const ghUrl = results.github?.url || 'N/A';
    console.log(`│  GitHub Pages     ${ghStatus}       ${ghUrl.padEnd(15)} │`);

    console.log('└─────────────────────────────────────────────┘');

    if (results.recommended) {
      console.log(`\n${c.bold}🎯 RECOMMENDED:${c.reset} ${results.recommended}`);
      console.log(`   ${c.cyan}${results.recommendedReason}${c.reset}\n`);
    }

    if (results.allUrls.length > 0) {
      console.log(`${c.green}🌐 AVAILABLE PREVIEW URLs:${c.reset}`);
      results.allUrls.forEach((url, i) => {
        console.log(`   ${i + 1}. ${c.blue}${url}${c.reset}`);
      });
      console.log('');
    }
  }

  // ========== Helper Methods ==========

  findAvailablePort(startPort) {
    for (let port = startPort; port < startPort + 100; port++) {
      try {
        const server = http.createServer();
        server.listen(port, '0.0.0.0', () => {
          server.close();
          return port;
        });
        return port; // Will use this port
      } catch (e) {
        continue;
      }
    }
    return startPort; // Fallback
  }

  createStaticServer(filePath, port) {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    return http.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(htmlContent);
    });
  }

  async ensureRepo(repoName) {
    const check = await this.githubRequest(`/repos/${this.username}/${repoName}`);
    
    if (check.status === 200) {
      log(`✅ Repo exists: ${repoName}`, 'green');
      return check.data.html_url;
    }

    const create = await this.githubRequest('/user/repos', 'POST', {
      name: repoName,
      description: '🚀 Auto-generated preview via AETH-1 Universal Preview',
      public: true,
      has_issues: false,
      has_projects: false,
      has_wiki: false,
      auto_init: false
    });

    if (create.status === 201) {
      log(`✅ Created repo: ${create.data.html_url}`, 'green');
      return create.data.html_url;
    }

    throw new Error(`Failed to create repo: ${create.data.message}`);
  }

  async deployToGitHub(sourcePath, repoName) {
    const tempDir = `/tmp/aeth-universal-${Date.now()}`;
    
    try {
      fs.mkdirSync(tempDir, { recursive: true });
      execSync(`cd "${tempDir}" && git init`, { stdio: 'pipe' });
      execSync(`cd "${tempDir}" && git config user.email "aeth-1@universal.preview"`, { stdio: 'pipe' });
      execSync(`cd "${tempDir}" && git config user.name "AETH-1 Bot"`, { stdio: 'pipe' });
      
      fs.writeFileSync(path.join(tempDir, 'index.html'), fs.readFileSync(sourcePath));
      
      fs.writeFileSync(path.join(tempDir, 'README.md'), `# Auto-Generated Preview

Generated by [AETH-1 Universal Preview](https://github.com/aeth-1/future-insights-platform)

*Deployed: ${new Date().toISOString()}*
`);

      execSync(`cd "${tempDir}" && git add . && git commit -m "🔄 Auto-update ${new Date().toISOString()}"`, { stdio: 'pipe' });
      
      const remoteUrl = `https://${this.token}@github.com/${this.username}/${repoName}.git`;
      execSync(`cd "${tempDir}" && git remote add origin "${remoteUrl}" && git push -u origin main --force`, { stdio: 'pipe', timeout: 60000 });
      
      log('✅ Code deployed!', 'green');
      return true;
    } finally {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  async enablePages(repoName) {
    const result = await this.githubRequest(
      `/repos/${this.username}/${repoName}/pages`,
      'POST',
      { source: { branch: 'main', path: '/' }, build_type: 'legacy' }
    );

    if (result.status === 201 || result.status === 200) {
      return result.data.html_url;
    }

    // Already enabled
    if (result.status >= 400) {
      const existing = await this.githubRequest(`/repos/${this.username}/${repoName}/pages`);
      return existing.data?.html_url;
    }

    throw new Error(result.data?.message);
  }

  async waitForDeployment(repoName, maxWait = 90000) {
    const start = Date.now();
    
    while (Date.now() - start < maxWait) {
      const result = await this.githubRequest(`/repos/${this.username}/${repoName}/pages`);
      const status = result.data?.status;
      const elapsed = Math.round((Date.now() - start) / 1000);

      if (status === 'built' || status === 'served') {
        return result.data.html_url;
      }

      log(`   [${elapsed}s] ${status}...`, 'yellow');
      await new Promise(r => setTimeout(r, 10000));
    }

    throw new Error('Deployment timeout');
  }

  githubRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(`https://api.github.com${endpoint}`);
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname + url.search,
        method,
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'AETH-1-Universal-Preview',
          'Content-Type': 'application/json'
        }
      }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
          catch { resolve({ status: res.statusCode, data: body }); }
        });
      });

      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this._server) {
      this._server.close();
      log(`\n🧹 Cleaned up local server (port ${this._serverPort})`, 'yellow');
    }
  }
}

// Simple fetch polyfill for Node.js
function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode }));
    }).on('error', reject);
  });
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const tokenIdx = args.indexOf('--token');
  const sourceIdx = args.indexOf('--source');
  const modeIdx = args.indexOf('--mode');
  const helpIdx = args.indexOf('--help') || args.indexOf('-h');

  if (helpIdx !== -1 || !args.length) {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║     🚀 AETH-1 UNIVERSAL PREVIEW SYSTEM                   ║
║     Two Options. Zero Configuration. Automatic.          ║
╚══════════════════════════════════════════════════════════╝

Usage:
  node universal-preview.js --token <TOKEN> [--options]

Required:
  --token <TOKEN>     GitHub Personal Access Token

Options:
  --source <PATH>     HTML file path (default: ./download/AETH-1-FULL-APPLICATION.html)
  --mode <MODE>       Preview mode:
                      • auto    - Try IDE first, fall back to GitHub (default)
                      • ide     - Local preview only
                      • github  - GitHub Pages only
                      • both    - Run both, show all URLs
  --help, -h          Show this help

Examples:
  # Auto mode (recommended - tries both, recommends best)
  node universal-preview.js --token ghp_xxxx

  # Force GitHub Pages only
  node universal-preview.js --token ghp_xxxx --mode github

  # Get both previews
  node universal-preview.js --token ghp_xxxx --mode both

Output:
  → One or more preview URLs
  → Recommendation on which to use
  → Ready to share with clients!

╔══════════════════════════════════════════════════════════╗
║  NO localhost/port configuration needed                 ║
║  NO manual browser clicks                                ║
║  NO downloads required                                  ║
║  Automatic fallback if one method fails                 ║
╚══════════════════════════════════════════════════════════╝
`);
    process.exit(0);
  }

  if (tokenIdx === -1) {
    console.error('❌ --token is required');
    process.exit(1);
  }

  const token = args[tokenIdx + 1];
  const sourceFile = sourceIdx !== -1 ? args[sourceIdx + 1] : './download/AETH-1-FULL-APPLICATION.html';
  const mode = modeIdx !== -1 ? args[modeIdx + 1] : 'auto';

  // Get username
  const userReq = await new Promise((resolve) => {
    https.get({
      hostname: 'api.github.com',
      path: '/user',
      headers: { 'Authorization': `token ${token}`, 'User-Agent': 'AETH-1' }
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
  });

  const preview = new UniversalPreview(token, userReq.login);
  const sourcePath = path.resolve(sourceFile);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ File not found: ${sourcePath}`);
    process.exit(1);
  }

  // Run automatic preview
  const results = await preview.autoPreview(sourcePath, { preferMethod: mode });

  // Exit with appropriate code
  process.exit(results.recommended ? 0 : 1);
}

module.exports = { UniversalPreview };

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}
