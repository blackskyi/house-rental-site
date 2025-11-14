#!/bin/bash

# Deployment Verification Script for OG Properties
# This script verifies that changes have been deployed successfully

echo "================================"
echo "OG Properties Deployment Verification"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check git status
echo "1. Checking Git Status..."
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✓ All changes committed${NC}"
else
    echo -e "${RED}✗ Uncommitted changes exist${NC}"
    git status --short
fi

# Check if local is in sync with remote
echo ""
echo "2. Checking if pushed to GitHub..."
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}✓ Local and remote in sync${NC}"
    echo "  Latest commit: $(git log -1 --oneline)"
else
    echo -e "${RED}✗ Local ahead of remote - need to push${NC}"
fi

# Check Railway deployment
echo ""
echo "3. Checking Railway Status..."
railway status

# Check deployed files
echo ""
echo "4. Verifying Deployed Files..."
DOMAIN="https://www.og-rooms.com"

# Check CSS version in HTML
echo -n "   Checking CSS version in index.html... "
CSS_VERSION=$(curl -s "$DOMAIN/" | grep -o 'styles.css?v=[0-9]*' | head -1)
if [ -n "$CSS_VERSION" ]; then
    echo -e "${GREEN}✓ Found: $CSS_VERSION${NC}"
else
    echo -e "${RED}✗ No version parameter found${NC}"
fi

# Check if Google colors are in CSS
echo -n "   Checking for Google colors in CSS... "
GOOGLE_RED=$(curl -s "$DOMAIN/$CSS_VERSION" | grep -c "google-red")
if [ "$GOOGLE_RED" -gt 0 ]; then
    echo -e "${GREEN}✓ Google colors found ($GOOGLE_RED references)${NC}"
else
    echo -e "${RED}✗ Google colors not found${NC}"
fi

# Check hero carousel images
echo -n "   Checking USC carousel images... "
USC_IMAGES=$(curl -s "$DOMAIN/" | grep -c "unsplash.com/photo-")
if [ "$USC_IMAGES" -ge 8 ]; then
    echo -e "${GREEN}✓ Found $USC_IMAGES carousel images${NC}"
else
    echo -e "${YELLOW}⚠ Found only $USC_IMAGES images${NC}"
fi

# Cache busting check
echo ""
echo "5. Cache Status..."
echo -e "${YELLOW}⚠ If you don't see changes, clear Cloudflare cache:${NC}"
echo "   1. Log in to Cloudflare dashboard"
echo "   2. Select og-rooms.com domain"
echo "   3. Go to Caching > Configuration"
echo "   4. Click 'Purge Everything'"
echo ""
echo "   OR clear browser cache:"
echo "   - Chrome/Edge: Ctrl+Shift+R (Cmd+Shift+R on Mac)"
echo "   - Firefox: Ctrl+F5 (Cmd+Shift+R on Mac)"
echo "   - Safari: Cmd+Option+R"

echo ""
echo "================================"
echo "Verification Complete"
echo "================================"
