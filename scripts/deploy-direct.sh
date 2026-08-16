#!/bin/bash
# Direct deployment to GitHub Pages via API
# This bypasses local build limitations

TOKEN="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"
REPO="testdemoqwenai2025-creator/future-insights-platform"
API="https://api.github.com/repos/$REPO"

echo "=== Starting Direct Deployment ==="

# Step 1: Check if we can at least commit and push source code
echo "Verifying git access..."
curl -s -H "Authorization: token $TOKEN" "$API" | grep full_name

# Step 2: Try to enable Pages with main branch (traditional method)
echo ""
echo "Attempting to enable GitHub Pages..."
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "$API/pages" \
  -d '{"source": {"branch": "main", "path": "/DemoSciCMP"}}')

echo "$RESPONSE" | grep -E '"html_url"|"status"|"message"' || echo "$RESPONSE"

echo ""
echo "=== Deployment Script Complete ==="
