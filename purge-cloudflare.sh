#!/bin/bash

# Cloudflare Cache Purge Script
# Automatically purges Cloudflare cache after deployment

# Configuration
# Add these to your environment or .env file:
# CLOUDFLARE_ZONE_ID=your_zone_id
# CLOUDFLARE_API_TOKEN=your_api_token

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================"
echo "Cloudflare Cache Purge"
echo "================================"
echo ""

# Check if credentials are set
if [ -z "$CLOUDFLARE_ZONE_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠ Cloudflare credentials not set${NC}"
    echo ""
    echo "To enable automatic cache purging, set these environment variables:"
    echo "  export CLOUDFLARE_ZONE_ID='your_zone_id'"
    echo "  export CLOUDFLARE_API_TOKEN='your_api_token'"
    echo ""
    echo "To get these values:"
    echo "  1. Log in to Cloudflare dashboard"
    echo "  2. Zone ID: Found on domain overview page"
    echo "  3. API Token: Create one with 'Cache Purge' permissions"
    echo ""
    echo "For now, please purge manually:"
    echo "  Cloudflare Dashboard → og-rooms.com → Caching → Purge Everything"
    exit 1
fi

# Purge cache
echo "Purging all cache for og-rooms.com..."
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}')

# Check if successful
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true')

if [ -n "$SUCCESS" ]; then
    echo -e "${GREEN}✓ Cache purged successfully!${NC}"
    echo ""
    echo "Wait 30 seconds then visit: https://www.og-rooms.com"
    echo "Use hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
else
    echo -e "${RED}✗ Cache purge failed${NC}"
    echo "Response: $RESPONSE"
    echo ""
    echo "Please purge manually via Cloudflare dashboard"
fi

echo ""
echo "================================"
