# Deployment Workflow for OG-Rooms

## Correct Deployment Process

Railway is configured to auto-deploy from GitHub. Always follow this workflow:

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

## Troubleshooting
If auto-deploy doesn't work:
1. Check Railway dashboard for errors
2. Verify the branch is set to "master" in Railway settings
3. Ensure all changes are committed and pushed to GitHub
