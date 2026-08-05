# 🚀 AETH-1 Platform - CI/CD Deployment Guide

Complete documentation for setting up, configuring, and troubleshooting the CI/CD pipeline for the AETH-1 Next.js application.

---

## Table of Contents

1. [Overview](#overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [Required Setup](#required-setup)
4. [Secrets Configuration](#secrets-configuration)
5. [Triggering Deployments](#triggering-deployments)
6. [Workflow Details](#workflow-details)
7. [Environment Setup](#environment-setup)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

The AETH-1 platform uses a comprehensive CI/CD pipeline built with **GitHub Actions** that provides:

- ✅ Automated code quality checks (ESLint, TypeScript)
- ✅ Unit and integration testing with coverage reports
- ✅ Production builds with artifact caching
- ✅ Automatic deployments to Vercel
- ✅ Preview deployments for pull requests
- ✅ Release management with changelogs
- ✅ Docker image publishing
- ✅ Database migration automation
- ✅ Dependency updates via Dependabot
- ✅ Team notifications (Slack/Discord)

### Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun 1.1.x |
| Framework | Next.js 16 |
| Database | SQLite (Prisma) |
| Hosting | Vercel |
| Container | Docker (optional) |
| CI/CD | GitHub Actions |

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GITHUB ACTIONS PIPELINE                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
   ┌─────────┐              ┌─────────────┐             ┌──────────────┐
   │   LINT  │              │ UNIT TESTS  │             │ INTEGRATION │
   │         │              │             │             │    TESTS     │
   └────┬────┘              └──────┬──────┘             └──────┬───────┘
        │                          │                            │
        └──────────────────────────┼────────────────────────────┘
                                   ▼
                          ┌────────────────┐
                          │     BUILD      │
                          │                │
                          └───────┬────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            ▼                     ▼                      ▼
     ┌────────────┐       ┌─────────────┐        ┌────────────┐
     │ PRODUCTION │       │   STAGING   │        │   DOCKER   │
     │  DEPLOY    │       │   DEPLOY    │        │   IMAGE    │
     └────────────┘       └─────────────┘        └────────────┘
```

---

## Required Setup

### Prerequisites

1. **GitHub Repository** with AETH-1 codebase
2. **Vercel Account** linked to GitHub
3. **Vercel Project** created and connected

### Initial Setup Steps

#### 1. Create Vercel Project

```bash
# Install Vercel CLI globally
npm i -g vercel

# Link your project to Vercel
vercel link

# Set up the project
vercel --prod
```

#### 2. Get Vercel Credentials

Navigate to your Vercel dashboard:

1. Go to **Settings** → **Tokens**
2. Create a new token with "Full Access" scope
3. Copy the token value

4. Go to **Settings** → **General**
5. Copy the **Project ID**

6. Go to **Settings** → **General** (or team settings)
7. Copy the **Organization ID**

---

## Secrets Configuration

### Required Secrets

Configure these in: **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel project settings or API |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel project settings |

### Optional Secrets

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL | Slack notifications |
| `DISCORD_WEBHOOK_URL` | Discord webhook URL | Discord notifications |
| `DOCKERHUB_USERNAME` | Docker Hub username | Docker image publishing |
| `DOCKERHUB_TOKEN` | Docker Hub access token | Docker image publishing |
| `PRODUCTION_DATABASE_URL` | Production DB connection string | Database migrations |
| `STAGING_DATABASE_URL` | Staging DB connection string | Staging migrations |

### Setting Up Secrets via CLI

```bash
# Using GitHub CLI
gh secret set VERCEL_TOKEN < vercel-token.txt
gh secret set VERCEL_ORG_ID < org-id.txt
gh secret set VERCEL_PROJECT_ID < project-id.txt

# Or use interactive mode
gh secret set VERCEL_TOKEN
# Paste the value when prompted
```

### Setting Up Secrets via Web UI

1. Navigate to your repository on GitHub
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter name and value
6. Click **Add secret**

---

## Triggering Deployments

### Automatic Triggers

| Event | Trigger | Action |
|-------|---------|--------|
| Push to `main` | Code push | Full pipeline + production deploy |
| Push to `develop` | Code push | Full pipeline + staging deploy |
| PR to `main`/`develop` | Pull request | Tests + preview deployment |
| Tag push (`v*`) | Version tag | Build + release + deploy |
| PR close | PR closed | Preview cleanup |

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **AETH-1 CI/CD Pipeline** workflow
3. Click **Run workflow**
4. Configure options:
   - **Environment**: `production`, `staging`, or `development`
   - **Skip tests**: Check to skip test suite
   - **Run migrations**: Check to run DB migrations after deploy
5. Click **Run workflow**

### Creating a Release

#### Option 1: Git Tag (Recommended)

```bash
# Create and push version tag
git tag v1.0.0
git push origin v1.0.0
```

This triggers the release workflow automatically.

#### Option 2: Manual Release Workflow

1. Go to **Actions** → **Release Pipeline**
2. Click **Run workflow**
3. Select:
   - **Release type**: `patch`, `minor`, `major`, `beta`, or `rc`
   - **Pre-release**: Mark as pre-release
   - **Generate changelog**: Auto-generate from commits
   - **Create tag**: Auto-create git tag
4. Click **Run workflow**

---

## Workflow Details

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

**File:** `.github/workflows/ci-cd.yml`

**Jobs:**

| Job | Purpose | Dependencies |
|-----|---------|--------------|
| `lint` | ESLint + TypeScript check | None |
| `test-unit` | Unit tests with coverage | lint |
| `test-integration` | Integration tests | lint |
| `build` | Production build | tests |
| `deploy-production` | Deploy to main | build (main only) |
| `deploy-staging` | Deploy to staging | build (develop only) |
| `docker-build` | Build Docker image | build (tags only) |
| `notify` | Send notifications | deploys |

**Caching Strategy:**
- Bun install cache based on lockfile hash
- Node modules cached per runner OS
- Build cache invalidated on dependency changes

### 2. Preview Deployment (`preview.yml`)

**File:** `.github/workflows/preview.yml`

**Features:**
- Deploys preview on every PR open/update
- Comments preview URL on PR
- Cleans up when PR is closed
- Runs quality checks for PRs targeting `main`

**Preview URLs format:**
```
https://<project>-<branch>-<username>.vercel.app
```

### 3. Release Pipeline (`release.yml`)

**File:** `.github/workflows/release.yml`

**Release Types:**
- **Stable:** `v1.0.0`, `v2.1.0`
- **Beta:** `v1.0.0-beta.1`
- **RC:** `v1.0.0-rc.1`
- **Alpha:** `v1.0.0-alpha.1`

**Release Process:**
1. Prepare version (extract from tag or calculate)
2. Run full test suite
3. Build production artifacts
4. Generate changelog from git history
5. Create GitHub release with assets
6. Build & publish Docker image
7. Deploy to production (stable releases only)

### 4. Database Migration (`migrate.yml`)

**File:** `.github/workflows/migrate.yml`

**Triggers:**
- After successful production deployment
- Manual trigger for any environment

**Commands:**
| Command | Use Case |
|---------|----------|
| `migrate deploy` | Apply pending migrations (production) |
| `db push` | Push schema directly (development) |
| `migrate dev` | Create new migration file |
| `migrate reset` | Reset database (requires confirmation) |

### 5. Dependabot (`dependabot.yml`)

**File:** `.github/dependabot.yml`

**Update Schedule:**
- **Bun packages:** Weekly (Monday 06:00 UTC)
- **GitHub Actions:** Weekly (Wednesday 06:00 UTC)
- **Docker:** Weekly (Friday 06:00 UTC)

**Grouped Updates:**
- Minor/patch updates grouped together
- Major updates separate for review
- Security updates prioritized

---

## Environment Setup

### Production Environment

**URL:** `https://aeth-1.vercel.app`

**Protection Rules (Recommended):**
- Require status checks before merge:
  - ✅ lint
  - ✅ test-unit
  - ✅ test-integration
  - ✅ build
- Require at least 1 approval for PRs
- Disallow force pushes
- Require signed commits (optional)

### Staging Environment

**URL:** `https://aeth-1-staging.vercel.app` (auto-generated)

**Purpose:**
- Test features before production
- Integration testing environment
- Pre-release validation

### Preview Environment

**URL:** Auto-generated per PR

**Lifecycle:**
- Created on PR open
- Updated on PR changes
- Deleted on PR close

---

## Troubleshooting

### Common Issues

#### 1. Vercel Deployment Fails

**Symptoms:** Deploy step fails with authentication error

**Solution:**
```bash
# Verify secrets are correct
echo ${{ secrets.VERCEL_TOKEN }} | head -c 10

# Test token locally
curl -X GET https://api.vercel.com/v2/user \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

**Checklist:**
- [ ] Token has correct permissions
- [ ] Org ID matches project's org
- [ ] Project ID is correct
- [ ] Token hasn't expired

#### 2. Build Failures

**Symptoms:** Build step fails during `next build`

**Common Causes:**
- TypeScript errors (check `tsc --noEmit`)
- Missing dependencies
- Environment variable issues

**Debug Steps:**
```bash
# Local reproduction
NODE_ENV=production bun run build

# Check build logs in Actions tab
# Look for specific error messages
```

#### 3. Test Failures

**Symptoms:** Unit/integration tests fail in CI but pass locally

**Common Causes:**
- Race conditions in async tests
- Missing test environment setup
- Database not initialized

**Solutions:**
```bash
# Ensure tests are deterministic
# Add proper cleanup in afterEach/afterAll
# Mock external services
```

#### 4. Cache Issues

**Symptoms:** Unexpected behavior after dependency update

**Solution:**
```bash
# Clear caches manually if needed
# Go to Actions → select failed run → ... → Clear caches
# Or wait for automatic invalidation
```

#### 5. Permission Errors

**Symptoms:** `Resource not accessible by integration`

**Solution:**
Check workflow permissions:
```yaml
permissions:
  contents: write      # For releases
  pull-requests: write # For PR comments
  id-token: write      # For OIDC auth (if needed)
```

### Debug Mode

Enable debug logging by adding this secret:
```
ACTIONS_STEP_DEBUG = true
ACTIONS_RUNNER_DEBUG = true
```

### Getting Help

1. **Check Logs:** Always review full workflow run logs
2. **Re-run Failed Jobs:** Use "Re-run failed jobs" button
3. **Re-run with Debug:** Enable debug mode for detailed output
4. **Local Reproduction:** Try running commands locally first
5. **GitHub Status:** Check https://www.githubstatus.com for outages

---

## Best Practices

### For Developers

1. **Write Good Commit Messages**
   ```
   feat(auth): add OAuth2 login support
   fix(api): resolve timeout issue on large queries
   docs(readme): update installation instructions
   ```

2. **Keep PRs Focused**
   - One feature/fix per PR
   - Descriptive title and description
   - Link related issues

3. **Test Your Changes**
   ```bash
   # Before pushing
   bun run lint
   bun run test:unit
   bun run test:integration
   bun run build
   ```

4. **Use Preview Deployments**
   - Review visual changes in preview
   - Test API endpoints
   - Share preview URL with team

### For Maintainers

1. **Monitor Pipeline Health**
   - Set up alerts for failures
   - Review notification integrations
   - Regular security audits

2. **Keep Dependencies Updated**
   - Review Dependabot PRs weekly
   - Schedule major version upgrades
   - Test compatibility thoroughly

3. **Document Changes**
   - Update CHANGELOG.md
   - Document breaking changes
   - Communicate deprecations early

### Security Best Practices

1. **Rotate Secrets Regularly**
   - Vercel tokens every 90 days
   - Webhook URLs as needed
   - Database credentials on compromise

2. **Limit Permissions**
   - Use minimal required scopes
   - Separate prod/staging credentials
   - Use OIDC where possible

3. **Audit Trail**
   - Keep workflow logs
   - Monitor access patterns
   - Review permission changes

---

## Quick Reference

### Useful Commands

```bash
# Local development
bun dev                    # Start dev server
bun run build              # Production build
bun run start              # Start production server
bun run lint               # Lint code
bun run test               # Run all tests
bun run test:coverage      # Tests with coverage

# Database
bunx prisma migrate dev    # Create new migration
bunx prisma migrate deploy # Apply migrations
bunx prisma db push        # Push schema changes
bunx prisma studio         # Open DB GUI

# Deployment
vercel                     # Deploy preview
vercel --prod              # Deploy production
vercel ls                  # List deployments
vercel rm <url>            # Remove deployment
```

### File Structure

```
.github/
├── workflows/
│   ├── ci-cd.yml          # Main CI/CD pipeline
│   ├── preview.yml        # Preview deployments
│   ├── release.yml        # Release management
│   └── migrate.yml        # Database migrations
├── dependabot.yml          # Dependency updates
└── DEPLOYMENT.md          # This documentation
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01 | 1.0.0 | Initial CI/CD pipeline setup |
| 2025-01 | 1.1.0 | Added preview deployment workflow |
| 2025-01 | 1.2.0 | Added release management pipeline |
| 2025-01 | 1.3.0 | Added database migration workflow |
| 2025-01 | 2.0.0 | Complete rewrite with Bun support |

---

*Last updated: January 2025*
*AETH-1 Platform Documentation*
