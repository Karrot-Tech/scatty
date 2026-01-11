# Required Assets for EAS Build

The following image assets are **REQUIRED** before you can build the Android app with EAS:

## 1. App Icon (`icon.png`)
- **Path**: `apps/mobile/assets/icon.png`
- **Size**: 1024×1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Main app icon shown in app stores and home screen
- **Design Tips**:
  - Keep design simple and recognizable at small sizes
  - Avoid text that's too small
  - Use solid colors and simple shapes

## 2. Adaptive Icon (`adaptive-icon.png`)
- **Path**: `apps/mobile/assets/adaptive-icon.png`
- **Size**: 1024×1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Android-specific adaptive icon
- **Design Tips**:
  - Center important content within 512×512px safe zone
  - Outer areas may be cropped on different devices
  - Background will be `#FFF9FB` (from app.json)

## 3. Splash Screen (`splash.png`)
- **Path**: `apps/mobile/assets/splash.png`
- **Size**: 1284×2778 pixels (minimum, larger is better)
- **Format**: PNG
- **Purpose**: Screen shown while app is loading
- **Design Tips**:
  - Background color matches `#FFF9FB`
  - Center your logo/branding
  - Keep it simple (users see it briefly)

## Tools to Create Icons

- **Icon Kitchen**: https://icon.kitchen/ (free, easy)
- **App Icon Generator**: https://www.appicon.co/ (free)
- **Figma**: Create custom designs
- **Canva**: Use templates

## Current Status

- ✅ `favicon.png` exists (web only)
- ❌ `icon.png` - **NEEDS TO BE CREATED**
- ❌ `adaptive-icon.png` - **NEEDS TO BE CREATED**
- ❌ `splash.png` - **NEEDS TO BE CREATED**

## Quick Start

If you need to build immediately for testing, you can:

1. Use a placeholder icon generator
2. Create simple colored squares with text
3. Use the same image for all three (not ideal but works for testing)

Example using ImageMagick:
```bash
# Create a simple placeholder (requires ImageMagick installed)
convert -size 1024x1024 xc:"#FF69B4" -pointsize 200 -fill white -gravity center -annotate +0+0 "S" icon.png
convert -size 1024x1024 xc:"#FF69B4" -pointsize 200 -fill white -gravity center -annotate +0+0 "S" adaptive-icon.png
convert -size 1284x2778 xc:"#FFF9FB" -pointsize 300 -fill "#FF69B4" -gravity center -annotate +0+0 "Scatty" splash.png
```

⚠️ **Important**: Replace placeholders with proper branding before production release!
