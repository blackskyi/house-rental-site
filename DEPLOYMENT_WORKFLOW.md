# Deployment Workflow for OG-Rooms

## Quick Deploy (Recommended)

Use the automated deployment script:

```bash
./deploy.sh
```

This script will:
1. Commit all changes
2. Push to GitHub
3. Wait for Railway deployment
4. Verify deployment success
5. Optionally purge Cloudflare cache

## Manual Deployment Process

Railway is configured to auto-deploy from GitHub. Follow this workflow:

### 1. Make Changes Locally
Edit your files as needed

### 2. Commit Changes
```bash
git add .
git commit -m "Your commit message"
```

### 3. Push to GitHub
```bash
git push origin master
```

### 4. Railway Auto-Deploys
Railway will automatically:
- Detect the push to master branch
- Build the application
- Deploy to production
- Updates will be live at www.og-rooms.com

### 5. Verify Deployment
```bash
./verify-deployment.sh
```

This checks:
- Git status
- GitHub sync
- Railway deployment
- Deployed file versions
- Google color scheme

### 6. Clear Cache (If Needed)
If you don't see changes on the live site:

**Option A: Automatic (requires Cloudflare credentials)**
```bash
./purge-cloudflare.sh
```

**Option B: Manual**
1. Go to Cloudflare dashboard
2. Select og-rooms.com
3. Caching → Purge Everything

**Option C: Browser Cache**
- Mac: Cmd+Shift+R
- Windows/Linux: Ctrl+Shift+R

## DO NOT Use
```bash
railway up  # Don't use this - it deploys from local files, bypassing GitHub
```

## Current Configuration
- **GitHub Repo**: blackskyi/house-rental-site
- **Branch**: master
- **Auto-Deploy**: Enabled
- **Production URL**: https://www.og-rooms.com
- **Railway URL**: https://tranquil-growth-production.up.railway.app
- **Server Port**: 8080 (configured in Railway domain settings)
- **Important**: Railway domains are configured to forward to port 8080 to match server.js

## Verify Deployment
After pushing to GitHub:
1. Visit https://railway.com/project/be259ac7-0346-466c-87b0-bb41273f99e9
2. Check the deployment status in the Activity panel
3. View logs if needed

## Setup Cloudflare Auto-Purge (Optional)

To enable automatic cache purging, set up Cloudflare API credentials:

### 1. Get Zone ID
1. Log in to Cloudflare
2. Select og-rooms.com domain
3. Copy Zone ID from the right sidebar

### 2. Create API Token
1. Go to Cloudflare → My Profile → API Tokens
2. Click "Create Token"
3. Use "Edit zone DNS" template or create custom with "Cache Purge" permission
4. Select og-rooms.com as the zone
5. Create and copy the token

### 3. Set Environment Variables
Add to your shell profile (~/.zshrc or ~/.bashrc):

```bash
export CLOUDFLARE_ZONE_ID="your_zone_id_here"
export CLOUDFLARE_API_TOKEN="your_api_token_here"
```

Then reload: `source ~/.zshrc`

### 4. Test Auto-Purge
```bash
./purge-cloudflare.sh
```

## Troubleshooting

### Changes Not Visible on Live Site
**Most Common Issue**: Cloudflare cache

Solution:
1. Run `./verify-deployment.sh` to confirm deployment succeeded
2. If verification passes but changes not visible, purge cache:
   - `./purge-cloudflare.sh` (if credentials set)
   - Or manually via Cloudflare dashboard
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Railway Auto-Deploy Issues
If auto-deploy doesn't work:
1. Check Railway dashboard for errors
2. Verify the branch is set to "master" in Railway settings
3. Ensure all changes are committed and pushed to GitHub
