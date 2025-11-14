# House Rental Website

A simple, Google-themed rental property listing website with integrated application form and scheduling.

## Features

- Photo and video gallery
- Online application form
- Automatic PDF generation and email notification
- Calendly integration for tour scheduling
- Mobile-responsive design
- Google Material Design theme

## Setup Instructions

### 1. Add Your Content

#### Property Details
Edit `index.html` and replace the placeholder text:
- Monthly rent amount
- Deposit amount
- Available date
- Lease term
- Amenities
- Address and location info
- Contact phone number

#### Images
1. Add your house photos to `assets/images/` folder
2. Edit `script.js` line 10 and add your image filenames:
```javascript
const images = [
    'front-view.jpg',
    'living-room.jpg',
    'bedroom.jpg',
    // ... add more
];
```

#### Videos
1. Add your house videos to `assets/videos/` folder
2. Edit `script.js` line 15 and add your video filenames:
```javascript
const videos = [
    'house-tour.mp4',
    'backyard-view.mp4',
    // ... add more
];
```

### 2. Setup Google Apps Script

1. Go to https://script.google.com/
2. Create a new project
3. Copy the entire content from `google-apps-script.js` into the editor
4. Click **Deploy** > **New deployment**
5. Select **Web app** as deployment type
6. Configure:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**
8. Copy the Web App URL
9. Paste it in `script.js` line 3:
```javascript
APPS_SCRIPT_URL: 'YOUR_COPIED_URL_HERE',
```
10. Authorize the script when prompted

### 3. Setup Calendly (Optional)

1. Create a free account at https://calendly.com
2. Create an event type for "House Tour"
3. Copy your Calendly event link
4. Edit `index.html` lines 153-160:
   - Remove the placeholder paragraph
   - Uncomment the Calendly widget code
   - Replace `YOUR_CALENDLY_LINK` with your actual link

### 4. Deploy to Railway

#### First Time Setup:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project (run from house-rental-site folder)
cd house-rental-site
railway init

# Deploy
railway up
```

#### Subsequent Deployments:
```bash
railway up
```

Your site will be live at a Railway-provided URL.

### 5. Custom Domain (Later)

When ready to use a custom domain:
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Settings** > **Domains**
4. Add your custom domain and follow DNS setup instructions

## File Structure

```
house-rental-site/
├── index.html              # Main HTML file
├── styles.css              # Google-themed styles
├── script.js               # Form handling and gallery logic
├── google-apps-script.js   # Backend script (copy to Google Apps Script)
├── Dockerfile              # Railway deployment config
├── railway.json            # Railway settings
├── assets/
│   ├── images/            # Add house photos here
│   └── videos/            # Add house videos here
└── README.md              # This file
```

## Customization

### Colors
Edit `styles.css` lines 2-10 to change the color scheme.

### Form Fields
Add/remove fields in `index.html` (section: application-form) and update:
- `script.js` - formData object
- `google-apps-script.js` - createPDF and email template

## Testing

1. Open `index.html` in a browser locally
2. Fill out the form
3. Check that PDF is sent to support@og-rooms.com

## Support

For issues or questions, contact: support@og-rooms.com

## License

Free to use for personal purposes.
