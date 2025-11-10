# Photo Upload System - User Guide

## Overview

The photo upload system allows property owners (like Sara) to upload photos through the admin panel, categorize them, and automatically generate instructions for adding them to the website via Git.

---

## How It Works

### For Property Owners:

1. **Login** to admin panel (admin.html)
2. **Upload** photos using the file input
3. **Categorize** each photo using dropdown menus
4. **Generate** upload instructions
5. **Follow** the downloaded instructions to commit to Git

### Behind the Scenes:

- Photos are read into browser (not uploaded to server yet)
- Owner assigns categories (Room 1, Kitchen, etc.)
- System generates:
  - Folder structure instructions
  - HTML code for property pages
  - Git commands to commit

---

## Step-by-Step Guide

### Step 1: Access Admin Panel

```
URL: https://your-site.com/admin.html
Password: houserental2025
```

### Step 2: Navigate to Photo Management

Scroll down to the property you want to add photos for (Property 1 or Property 2).

### Step 3: Upload Photos

Click "Choose Files" and select multiple photos from your computer.

**What You'll See:**
- Thumbnail preview of each photo
- File name and size
- Category dropdown (defaulted to "-- Select Category --")
- Remove button

### Step 4: Categorize Photos

For each photo, select the appropriate category from the dropdown:

**Property 1 Categories:**
- Room 1
- Room 2
- Room 3
- Kitchen
- Bathroom
- Living Room
- Backyard
- House Front
- Hallway
- Closet

**Property 2 Categories:**
- House Front
- Room 1-5
- Kitchen
- Bathroom
- Hallway (Upstairs)
- Closet
- Backyard

**Important:** Photos left as "-- Select Category --" will be marked as "ungrouped" in instructions.

### Step 5: Generate Instructions

Click the blue "Generate Upload Instructions" button.

**This Downloads a Text File With:**
1. Folder structure to create
2. Where to save each photo
3. HTML code to add to property pages
4. Git commands to run
5. Verification checklist

### Step 6: Follow the Instructions

Open the downloaded text file and follow the 5 steps:

1. **Save photos** from browser (or use original files)
2. **Create folder structure** in assets/images/
3. **Copy and rename** photos into correct folders
4. **Update HTML** with provided code
5. **Commit to Git** and push

---

## Example Workflow

### Sarah wants to add 5 photos to Property 2:

**Photos:**
- IMG_1234.jpg (front of house)
- IMG_1235.jpg (kitchen view 1)
- IMG_1236.jpg (kitchen view 2)
- IMG_1237.jpg (room 1)
- IMG_1238.jpg (backyard)

**Steps:**

1. **Upload** all 5 photos
2. **Categorize**:
   - IMG_1234.jpg → House Front
   - IMG_1235.jpg → Kitchen
   - IMG_1236.jpg → Kitchen
   - IMG_1237.jpg → Room 1
   - IMG_1238.jpg → Backyard

3. **Generate Instructions** (downloads text file)

4. **Follow Instructions**:

```
assets/images/property-2/
├── house-front/
│   └── 1.jpg  (from IMG_1234.jpg)
├── kitchen/
│   ├── 4.jpg  (from IMG_1235.jpg)
│   └── 5.jpg  (from IMG_1236.jpg)
├── room-1/
│   └── 3.jpg  (from IMG_1237.jpg)
└── backyard/
    └── 4.jpg  (from IMG_1238.jpg)
```

5. **Update HTML** with provided code:

```html
<!-- House Front Section -->
<section class="gallery">
    <h2>House Front</h2>
    <div class="gallery-grid">
        <div class="gallery-item">
            <img src="assets/images/property-2/house-front/1.jpg"
                 alt="House Front - View 1"
                 onclick="openModal(this.src)">
        </div>
    </div>
</section>

<!-- Kitchen Section -->
<section class="gallery">
    <h2>Kitchen</h2>
    <div class="gallery-grid">
        <div class="gallery-item">
            <img src="assets/images/property-2/kitchen/4.jpg"
                 alt="Kitchen - View 1"
                 onclick="openModal(this.src)">
        </div>
        <div class="gallery-item">
            <img src="assets/images/property-2/kitchen/5.jpg"
                 alt="Kitchen - View 2"
                 onclick="openModal(this.src)">
        </div>
    </div>
</section>

... (etc)
```

6. **Git Commands**:

```bash
git add assets/images/property-2/
git add property-2.html
git commit -m "Add 5 photos to Property 2 (5B3B)"
git push
```

7. **Wait 2-3 minutes** for Railway to deploy

8. **Check live site** to verify photos appear

---

## Features

### ✅ What It Does:

- **Handles multiple photos** at once
- **Preview thumbnails** before committing
- **Category organization** matches Sara's current structure
- **Generates exact HTML code** needed
- **Provides git commands** to copy/paste
- **Warns about ungrouped photos**
- **Calculates photo counts** per category
- **Remove individual photos** before generating instructions

### ❌ What It Doesn't Do:

- **Doesn't auto-upload** photos to server (manual git workflow)
- **Doesn't auto-update** HTML files (you edit them)
- **Doesn't resize** or optimize images (do that before uploading)
- **Doesn't rename files** automatically (you do that based on instructions)

---

## Why This Approach?

### Current State (Git as Database):

**Pros:**
- Free hosting
- Version control
- No database costs
- Simple for small scale

**Cons:**
- Manual photo upload process
- Owner needs to follow instructions
- Requires basic git knowledge

### Future State (When Scaling):

You mentioned migrating to a real database later. At that point:

- Photos upload directly to cloud storage (S3, Cloudinary)
- Database stores photo metadata
- Admin panel auto-updates property pages
- No git commands needed

**For now, Git works perfectly** for 1-2 property owners.

---

## Troubleshooting

### "Photos not showing after git push"

**Check:**
1. Did Railway deployment finish? (2-3 minutes)
2. Are photo paths correct in HTML?
3. Are photos in correct folders?
4. Did you hard-refresh browser (Cmd+Shift+R)?

### "Generate button doesn't work"

**Check:**
1. Did you assign categories to photos?
2. Did you upload at least 1 photo?
3. Try refreshing the admin page

### "Ungrouped photos warning"

**Action:**
- Go back and select categories from dropdowns
- Click "Generate Instructions" again

### "Can't find the category I need"

**Solution:**
- Categories are based on Sara's existing properties
- To add new categories:
  1. Edit admin.html
  2. Add to PHOTO_CATEGORIES array
  3. Create corresponding folder in assets/images/

---

## Adding New Categories

If you need a new category (e.g., "Garage", "Patio"):

**In admin.html, find:**

```javascript
const PHOTO_CATEGORIES = {
    'property-2': [
        { value: 'ungrouped', label: '-- Select Category --' },
        { value: 'house-front', label: 'House Front' },
        // ... existing categories
    ]
};
```

**Add your new category:**

```javascript
{ value: 'garage', label: 'Garage' },
{ value: 'patio', label: 'Patio' },
```

**Then:**
1. Create folder: `assets/images/property-2/garage/`
2. Category will now appear in dropdown
3. Follow normal workflow

---

## For Future Multi-Owner Platform

When you scale to multiple owners:

### Phase 1 (Current - Git):
- Each owner uses admin panel
- Follows git instructions
- Manual but works

### Phase 2 (Database):
- Owner uploads → Goes to S3/Cloudinary
- Saved to database with property_id, category
- Property pages dynamically load from database
- No git needed

### Phase 3 (Full Platform):
- Owner signup/login
- Drag-and-drop photo uploader
- Auto-categorization with AI
- Instant publish (no deploy wait)
- Edit/delete photos anytime

**Current system prepares you** for this by:
- Establishing category structure
- Defining photo workflow
- Testing user experience

---

## Security Note

**Photos in Git:**
- Make sure photos don't contain:
  - Personal information
  - Address numbers visible
  - License plates
  - Documents with sensitive data

**Admin Panel:**
- Change default password in admin.html
- Don't share admin URL publicly
- Consider adding IP whitelist later

---

## Summary

**For Property Owners:**
1. Upload photos in admin panel
2. Categorize them
3. Follow downloaded instructions
4. Photos appear on site in 2-3 minutes

**For You (Platform Operator):**
- System generates exact instructions
- Reduces errors
- Maintains organized structure
- Scales to multiple owners easily

**Database Migration Path:**
- Current: Git (manual, free, works)
- Future: S3 + Database (automatic, costs $$, scales)
- Transition: Gradual as you grow

---

## Next Steps

1. **Test the system** with a few photos
2. **Train Sara** on how to use it
3. **Document any issues** you find
4. **Consider** adding video upload support (same workflow)
5. **Plan** database migration timeline

---

*Last Updated: [Date]*
*System Version: 1.0 (Git-based)*
