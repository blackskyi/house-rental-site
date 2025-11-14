#!/bin/bash

# Complete Deployment Script for OG Properties
# Commits, pushes, verifies, and optionally purges Cloudflare cache

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}OG Properties Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}No changes to commit${NC}"
else
    # Show changes
    echo "Changes to be committed:"
    git status --short
    echo ""

    # Ask for commit message
    echo -n "Enter commit message (or press Enter for auto-generated): "
    read COMMIT_MSG

    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Update site - $(date '+%Y-%m-%d %H:%M')"
    fi

    # Add full signature
    FULL_MSG="$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    # Commit
    echo ""
    echo "Committing changes..."
    git add -A
    git commit -m "$FULL_MSG"
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
if git push; then
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
else
    echo -e "${RED}✗ Push failed${NC}"
    exit 1
fi

# Wait for Railway deployment
echo ""
echo "Waiting for Railway to deploy (15 seconds)..."
sleep 15

# Run verification
echo ""
./verify-deployment.sh

# Ask about cache purge
echo ""
echo -n "Purge Cloudflare cache? (y/n): "
read PURGE_CACHE

if [ "$PURGE_CACHE" = "y" ] || [ "$PURGE_CACHE" = "Y" ]; then
    ./purge-cloudflare.sh
else
    echo ""
    echo -e "${YELLOW}⚠ Remember to clear your browser cache:${NC}"
    echo "   Mac: Cmd+Shift+R"
    echo "   Windows/Linux: Ctrl+Shift+R"
fi

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo "   Visit: https://www.og-rooms.com"
echo ""
