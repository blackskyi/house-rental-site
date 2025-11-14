# Hero Carousel Images

This directory contains images for the homepage hero carousel that rotates automatically.

## Adding Indian-Themed Images

To attract Indian students, add images to this directory with themes like:

1. **Campus Life**: Indian students studying, socializing
2. **Cultural Mix**: Blend of American and Indian culture (e.g., Diwali celebrations in LA)
3. **Local Landmarks**: LA landmarks familiar to Indian students
4. **Community**: Indian student community events
5. **Modern Living**: Modern apartments with diverse student groups

## How to Add Images to the Carousel

1. Place your images in this directory (assets/images/hero-carousel/)
2. Open `index.html` (in the project root)
3. Find the "Hero Section with Search" section
4. Add a new slide div inside `<div class="hero-slides">`:

```html
<div class="hero-slide" style="background-image: url('assets/images/hero-carousel/your-image-name.jpg')"></div>
```

## Image Specifications

- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 1920x1080px (Full HD) or higher
- **Aspect Ratio**: 16:9 or wider
- **File Size**: Optimize to under 500KB for faster loading

## Current Slides

The carousel currently uses property images as placeholders. Replace these with:
- LA cityscape images (palm trees, downtown LA, beaches)
- Indian-themed images for cultural connection
- Student life images showing diversity

## Example Filenames

- `la-skyline-sunset.jpg`
- `indian-students-campus.jpg`
- `diwali-celebration.jpg`
- `santa-monica-beach.jpg`
- `student-community.jpg`
