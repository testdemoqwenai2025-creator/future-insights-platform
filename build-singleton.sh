#!/bin/bash
# =============================================================================
# BUILD SINGLETON - Scala-inspired singleton pattern for Next.js builds
# =============================================================================
# Problem: Multiple build processes, zombie processes, lock file deadlocks
# Solution: Ensure ONLY ONE clean build runs at a time
# =============================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  BUILD SINGLETON INITIALIZED${NC}"
echo "======================================"
echo "Time: $(date)"
echo "Host: $(hostname)"
echo "User: $(whoami)"

# =====================================================================
# PHASE 1: CLEAN SLATE (Singleton Precondition)
# =====================================================================
echo ""
echo -e "${YELLOW}[PHASE 1] Cleaning previous builds...${NC}"

# Kill ANY existing node/next processes (singleton enforcement)
echo "→ Terminating existing Node.js processes..."
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node.*build" 2>/dev/null || true
pkill -9 -f "turbopack" 2>/dev/null || true
sleep 2

# Verify no zombie processes remain
REMAINING=$(ps aux | grep -E "next|node" | grep -v grep | wc -l)
if [ "$REMAINING" -gt 0 ]; then
    echo -e "${RED}⚠️  Warning: $REMAINING processes still running${NC}"
    ps aux | grep -E "next|node" | grep -v grep
else
    echo -e "${GREEN}✓ No conflicting processes${NC}"
fi

# Remove lock files that cause deadlocks
echo "→ Removing lock files..."
rm -rf .next/lock .next/cache/*.lock 2>/dev/null || true
rm -rf out 2>/dev/null || true
rm -rf .next 2>/dev/null || true

# Clear npm cache if needed
echo "→ Clearing caches..."
rm -rf node_modules/.cache 2>/dev/null || true

echo -e "${GREEN}✓ Clean slate achieved${NC}"

# =====================================================================
# PHASE 2: ENVIRONMENT CHECK
# =====================================================================
echo ""
echo -e "${YELLOW}[PHASE 2] Checking environment...${NC}"

# Check memory available
if command -v free &> /dev/null; then
    MEM_TOTAL=$(free -g | awk '/^Mem:/{print $2}')
    MEM_AVAIL=$(free -g | awk '/^Mem:/{print $7}')
    echo "→ Memory: ${MEM_AVAIL}GB available / ${MEM_TOTAL}GB total"
    
    if [ "$MEM_AVAIL" -lt 1 ]; then
        echo -e "${RED}⚠️  Low memory warning (< 1GB)${NC}"
    fi
fi

# Check disk space
DISK_AVAIL=$(df -h . | awk 'NR==2{print $4}')
echo "→ Disk space available: $DISK_AVAIL"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
echo "→ Node.js: $NODE_VERSION"

NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
echo "→ npm: $NPM_VERSION"

# =====================================================================
# PHASE 3: SINGLETON BUILD EXECUTION
# =====================================================================
echo ""
echo -e "${YELLOW}[PHASE 3] Running singleton build...${NC}"
echo "This may take 2-5 minutes..."

# Set environment variables for optimal build
export NODE_OPTIONS="--max-old-space-size=1536"
export NEXT_TELEMETRY_DISABLED=1
export CI=true
export NODE_ENV=production

# Create a PID file to track this build instance
PID_FILE="/tmp/scicmph-build.pid"
echo $$ > "$PID_FILE"
echo "→ Build PID: $$ (recorded in $PID_FILE)"

# Run build with timeout protection (10 minute max)
BUILD_START=$(date +%s)
BUILD_STATUS="unknown"

# Use script to capture all output
if timeout 600 npm run build 2>&1 | tee /tmp/build-singleton.log; then
    BUILD_STATUS="success"
else
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 124 ]; then
        BUILD_STATUS="timeout"
    else
        BUILD_STATUS="failed"
    fi
fi

BUILD_END=$(date +%s)
BUILD_DURATION=$((BUILD_END - BUILD_START))

echo ""
echo -e "${YELLOW}[BUILD RESULT]${NC}"
echo "Duration: ${BUILD_DURATION}s"
echo "Status: $BUILD_STATUS"

# =====================================================================
# PHASE 4: OUTPUT VERIFICATION
# =====================================================================
echo ""
echo -e "${YELLOW}[PHASE 4] Verifying build output...${NC}"

OUTPUT_DIR="out"
DEMO_DIR="out/DemoSciCMP"

if [ -d "$OUTPUT_DIR" ]; then
    FILE_COUNT=$(find "$OUTPUT_DIR" -type f | wc -l)
    DIR_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)
    
    echo -e "${GREEN}✓ Build output exists${NC}"
    echo "→ Files generated: $FILE_COUNT"
    echo "→ Total size: $DIR_SIZE"
    
    # Check for critical files
    CRITICAL_FILES=(
        "out/index.html"
        "out/DemoSciCMP/index.html"
        "out/_next/static"
    )
    
    MISSING_FILES=0
    for file in "${CRITICAL_FILES[@]}"; do
        if [ -e "$file" ]; then
            echo -e "  ${GREEN}✓${NC} $file"
        else
            echo -e "  ${RED}✗${NC} $file (missing)"
            ((MISSING_FILES++))
        fi
    done
    
    if [ "$MISSING_FILES" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $MISSING_FILES critical files missing${NC}"
    fi
    
    # Check for template routing code in JS bundles
    echo ""
    echo "→ Checking for template routing code..."
    TEMPLATE_CHECK=$(grep -rl "TemplateGallery\|parseHashRoute\|templates/" "$OUTPUT_DIR/_next/static/chunks/" 2>/dev/null | head -3 || echo "")
    
    if [ -n "$TEMPLATE_CHECK" ]; then
        echo -e "${GREEN}✓ Template routing code found in:${NC}"
        echo "$TEMPLATE_CHECK"
    else
        echo -e "${YELLOW}⚠️  Template routing code not detected in chunks${NC}"
    fi
    
else
    echo -e "${RED}✗ Build output NOT found at $OUTPUT_DIR${NC}"
    
    # Show last 50 lines of build log for debugging
    echo ""
    echo "--- Last 50 lines of build log ---"
    tail -50 /tmp/build-singleton.log 2>/dev/null || echo "No build log available"
fi

# =====================================================================
# PHASE 5: DEPLOYMENT (Optional)
# =====================================================================
echo ""
echo -e "${YELLOW}[PHASE 5] Deployment status...${NC}"

if [ -d "$OUTPUT_DIR" ] && [ "$BUILD_STATUS" = "success" ]; then
    echo -e "${GREEN}✅ BUILD SINGLETON COMPLETED SUCCESSFULLY${NC}"
    echo ""
    echo "======================================"
    echo "📦 Build Artifacts Ready"
    echo "======================================"
    echo "Output Directory: $(pwd)/$OUTPUT_DIR"
    echo "Size: $(du -sh $OUTPUT_DIR | cut -f1)"
    echo "Files: $(find $OUTPUT_DIR -type f | wc -l)"
    echo ""
    echo "Next Step: Run deploy-github-pages.sh to deploy"
    echo "======================================"
    
    # Clean up PID file
    rm -f "$PID_FILE"
    
    exit 0
else
    echo -e "${RED}❌ BUILD FAILED${NC}"
    echo ""
    echo "======================================"
    echo "🔍 Debugging Information"
    echo "======================================"
    echo "Build Status: $BUILD_STATUS"
    echo "Build Duration: ${BUILD_DURATION}s"
    echo ""
    echo "Full build log: /tmp/build-singleton.log"
    echo "======================================"
    
    # Don't remove PID file for debugging
    exit 1
fi
