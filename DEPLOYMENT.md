# Scatty Deployment Guide

This guide covers deploying the Scatty backend to Railway and distributing the Android app via EAS Build.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Railway Deployment (Backend)](#railway-deployment-backend)
3. [EAS Build (Android App)](#eas-build-android-app)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Required Assets (MUST CREATE BEFORE BUILDING)

The following image assets are required for mobile app builds but are currently **missing**:

- [ ] **App Icon** (`apps/mobile/assets/icon.png`)
  - Size: 1024x1024 pixels
  - Format: PNG with transparency
  - Should represent your Scatty branding

- [ ] **Adaptive Icon** (`apps/mobile/assets/adaptive-icon.png`)
  - Size: 1024x1024 pixels
  - Format: PNG with transparency
  - Android-specific, center content in safe zone (512x512)

- [ ] **Splash Screen** (`apps/mobile/assets/splash.png`)
  - Size: 1284x2778 pixels (or larger)
  - Format: PNG
  - Background color matches `#FFF9FB` in app.json

**Note:** You can use tools like [Icon Kitchen](https://icon.kitchen/) or [App Icon Generator](https://www.appicon.co/) to create these assets from a single source image.

### Required Accounts & Tools

- [ ] Railway account ([railway.app](https://railway.app))
- [ ] Expo account ([expo.dev](https://expo.dev))
- [ ] Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Git repository pushed to GitHub (recommended)

---

## Railway Deployment (Backend)

### Step 1: Prepare Environment Variables

Before deploying, you'll need:

1. **GEMINI_API_KEY**: Your Google Gemini API key
2. **ALLOWED_ORIGINS**: Comma-separated list of allowed CORS origins (set to `*` initially, then restrict after testing)
3. **NODE_ENV**: Will be automatically set to `production` by Railway config
4. **PORT**: Will be automatically set by Railway

### Step 2: Deploy to Railway

#### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. Go to [railway.app](https://railway.app) and sign in

3. Click **"New Project"** → **"Deploy from GitHub repo"**

4. Select your `scatty` repository

5. Railway will automatically detect the Node.js project

6. Add environment variables:
   - Click on your service
   - Go to **Variables** tab
   - Add:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ALLOWED_ORIGINS=*
     ```

7. Railway will automatically build and deploy using the `railway.toml` configuration

#### Option B: Deploy using Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize Railway project:
   ```bash
   railway init
   ```

4. Add environment variables:
   ```bash
   railway variables set GEMINI_API_KEY=your_actual_api_key_here
   railway variables set ALLOWED_ORIGINS=*
   ```

5. Deploy:
   ```bash
   railway up
   ```

### Step 3: Get Your Railway URL

1. After deployment, Railway will provide a public URL like:
   ```
   https://scatty-production-xxxx.up.railway.app
   ```

2. Copy this URL - you'll need it for the mobile app configuration

3. Test the health endpoint:
   ```bash
   curl https://your-railway-url.railway.app/health
   ```

   Expected response:
   ```json
   {"status":"ok","timestamp":1234567890}
   ```

### Step 4: Configure CORS (Production Security)

After initial testing, restrict CORS to your actual origins:

1. In Railway dashboard → Variables, update:
   ```
   ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
   ```

2. For mobile app only (recommended):
   ```
   ALLOWED_ORIGINS=*
   ```

   Note: Mobile apps don't send Origin headers, so `*` is safe for mobile-only backends.

### Step 5: Configure Custom Domain (api.scatty.xyz)

To use `api.scatty.xyz` instead of the default Railway URL:

#### In Railway Dashboard:

1. Go to your Scatty service → **Settings** → **Domains**

2. Click **"Add Custom Domain"**

3. Enter: `api.scatty.xyz`

4. Railway will show you the required DNS records

#### In Your DNS Provider (e.g., Cloudflare, Namecheap):

1. Add a **CNAME record**:
   ```
   Type: CNAME
   Name: api
   Target: <your-railway-url>.up.railway.app
   TTL: Auto (or 300)
   ```

2. If using Cloudflare, set **Proxy status** to "DNS only" (gray cloud) initially for easier debugging

3. Wait for DNS propagation (usually 5-30 minutes)

#### Verify Custom Domain:

```bash
# Test the custom domain
curl https://api.scatty.xyz/v1/health

# Expected response:
# {"status":"ok","version":"1.0.0","timestamp":...}
```

#### Update Mobile App Configuration:

After custom domain is working, update `apps/mobile/eas.json`:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_SERVER_URL": "https://api.scatty.xyz"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SERVER_URL": "https://api.scatty.xyz"
      }
    }
  }
}
```

#### Update CORS Origins:

Update Railway environment variables to include your domains:

```
ALLOWED_ORIGINS=https://scatty.xyz,https://app.scatty.xyz
```

---

## EAS Build (Android App)

> **Important:** This is a monorepo. All EAS commands must be run from the `apps/mobile` directory, not the repository root. Running from the root will cause "Unable to resolve module ../../App" errors.

### Step 1: Configure EAS Project

1. **Navigate to the mobile app directory:**
   ```bash
   cd apps/mobile
   ```

2. Login to EAS:
   ```bash
   eas login
   ```

3. Configure the project:
   ```bash
   eas build:configure
   ```

   This will:
   - Create an EAS project
   - Update the `projectId` in `app.json`

### Step 2: Update Server URL in EAS Config

Edit `apps/mobile/eas.json` and replace the placeholder URLs with your actual Railway URL:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_SERVER_URL": "https://your-railway-url.railway.app"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SERVER_URL": "https://your-railway-url.railway.app"
      }
    }
  }
}
```

### Step 3: Create App Icons and Splash Screen

**CRITICAL:** Before building, you MUST create the required image assets listed in the [Pre-Deployment Checklist](#required-assets-must-create-before-building).

Place these files in `apps/mobile/assets/`:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash.png` (1284x2778 or larger)

### Step 4: Build Android APK

#### Build for Preview (Internal Testing)

```bash
cd apps/mobile
eas build --platform android --profile preview
```

This will:
- Build an APK (not AAB) for easy distribution
- Use the preview server URL
- Generate a downloadable APK

#### Build for Production

```bash
cd apps/mobile
eas build --platform android --profile production
```

This will:
- Build an APK for production
- Use the production server URL
- Generate a downloadable APK

### Step 5: Download and Distribute APK

1. After the build completes, EAS will provide a download URL

2. Download the APK:
   ```bash
   # EAS will show the URL, or check:
   eas build:list
   ```

3. Distribution options:
   - **Direct Download**: Share the EAS download link (expires after 30 days)
   - **QR Code**: EAS provides a QR code for easy mobile download
   - **Internal Testing**: Upload to Google Play Console (Internal Testing track)
   - **Self-hosting**: Download APK and host on your own server

### Step 6: Share with Testers

**For Preview Builds:**
```bash
eas build --platform android --profile preview
```

After build completes:
1. Copy the build URL from EAS output
2. Share with testers via:
   - Direct link
   - QR code (shown in EAS dashboard)
3. Testers must enable "Install from Unknown Sources" on Android

**For Production Release:**
1. Download the APK from EAS
2. Upload to Google Play Console:
   - Go to [Google Play Console](https://play.google.com/console)
   - Create app listing (if first time)
   - Upload APK to Internal Testing or Production track

---

## Post-Deployment Verification

### Backend Verification

1. **Health Check:**
   ```bash
   curl https://your-railway-url.railway.app/health
   ```
   Expected: `{"status":"ok","timestamp":...}`

2. **WebSocket Connection:**
   ```bash
   # In Railway logs, you should see:
   # ✓ Gemini AI initialized
   # Server listening on port 3001
   ```

3. **Check Railway Logs:**
   - Go to Railway dashboard
   - Click on your service
   - View **Deployments** → **Logs**
   - Look for successful startup message

### Mobile App Verification

1. **Install APK** on Android device

2. **Check Connection:**
   - Open Scatty app
   - It should auto-connect to your Railway server
   - Avatar should show "idle" state

3. **Test Features:**
   - [ ] Voice input works (tap and hold mic button)
   - [ ] Text input works (tap text button)
   - [ ] AI responds with streaming text
   - [ ] Text-to-speech plays response
   - [ ] Camera button visible (for future vision feature)

4. **Settings Check:**
   - Open Settings (gear icon)
   - Verify Server URL shows your Railway URL
   - Test reconnection

### Common Issues

**"Connection failed" in app:**
- Check Railway logs for errors
- Verify GEMINI_API_KEY is set
- Test health endpoint manually
- Check if Railway service is running

**"Voice recognition not working":**
- Ensure microphone permissions granted
- Voice recognition requires physical device
- Try text input as fallback

**"AI not responding":**
- Check Railway logs for Gemini API errors
- Verify API key is valid and has quota
- Check API key at [Google AI Studio](https://aistudio.google.com/apikey)

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Google Gemini API key |
| `PORT` | Auto | `3001` | Set automatically by Railway |
| `NODE_ENV` | Auto | `production` | Set by railway.toml |
| `ALLOWED_ORIGINS` | ⚠️ Recommended | `*` | CORS allowed origins (comma-separated) |

### Mobile App (EAS Build)

| Variable | Profile | Default | Description |
|----------|---------|---------|-------------|
| `EXPO_PUBLIC_SERVER_URL` | All | `http://localhost:3001` | Backend server URL |

Set in `eas.json` for each build profile:
- **development**: `http://localhost:3001` (local dev server)
- **preview**: Your Railway URL (for testing)
- **production**: Your Railway URL (for release)

---

## Cost Estimates

### Railway
- **Free Tier**: $5 credit/month (enough for small projects)
- **Hobby Plan**: $5/month (500 hours)
- **Usage-based**: ~$0.01/hour when active

### EAS Build
- **Free Tier**: Limited builds per month
- **Production Plan**: $29/month (unlimited builds)
- **Pay-as-you-go**: ~$0.50-1.00 per build

### Google Gemini API
- **Free Tier**: 15 requests/minute, 1500 requests/day
- **Paid**: $0.00025/1K characters (Flash model)

---

## Maintenance & Updates

### Update Backend (Railway)

Railway auto-deploys when you push to main branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway will automatically rebuild and redeploy.

### Update Mobile App

1. Update version in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1",  // Bump this
       "android": {
         "versionCode": 2    // Increment this
       }
     }
   }
   ```

2. Build new version:
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```

3. Distribute new APK to users

### Monitor Deployments

**Railway:**
- Dashboard: [railway.app](https://railway.app)
- View logs, metrics, and deployments

**EAS:**
- Dashboard: [expo.dev](https://expo.dev)
- View builds, crashes, and updates

---

## Security Checklist

Before going to production:

- [ ] Restrict CORS origins (don't use `*` in production if serving web clients)
- [ ] Use HTTPS for all endpoints (Railway provides this automatically)
- [ ] Rotate API keys regularly
- [ ] Set up Railway environment variable encryption
- [ ] Enable Railway IP allowlisting if needed
- [ ] Review Gemini API usage quotas and limits
- [ ] Set up monitoring and alerting (Railway has built-in metrics)
- [ ] Review app permissions in Android manifest

---

## Troubleshooting

### Railway Build Fails

**Error: "Build failed"**
- Check Railway build logs
- Verify `railway.toml` is correct
- Ensure all dependencies are in `package.json`
- Try: `npm run build:shared && npm run build:server` locally

**Error: "GEMINI_API_KEY not set"**
- Server will exit in production if this is missing
- Add in Railway Variables tab

### EAS Build Fails

**Error: "Unable to resolve module ../../App"**
- You ran EAS from the monorepo root instead of `apps/mobile`
- Fix: `cd apps/mobile && eas build --platform android --profile preview`
- Do NOT run EAS commands from the repository root

**Error: "Missing icon.png"**
- Create required assets (see Pre-Deployment Checklist)
- Ensure files are in `apps/mobile/assets/`

**Error: "Project not configured"**
- Run `cd apps/mobile && eas build:configure` first
- Update `projectId` in `apps/mobile/app.json`

**Error: "Build queue timeout"**
- EAS free tier has limited concurrent builds
- Wait for queue or upgrade to Production plan

### Runtime Issues

**WebSocket connection fails:**
- Check Railway service is running
- Verify Railway URL is correct in app
- Check Railway logs for errors
- Test health endpoint: `curl https://your-url/health`

**Gemini API errors:**
- Check API quota at [Google AI Studio](https://aistudio.google.com/apikey)
- Verify API key is valid
- Check Railway logs for specific error messages

---

## Next Steps

After successful deployment:

1. **Test thoroughly** on multiple Android devices
2. **Gather feedback** from beta testers
3. **Monitor Railway logs** for errors and usage
4. **Set up analytics** (optional: Expo Analytics, Sentry)
5. **Plan Google Play Store release** (requires developer account $25 one-time fee)
6. **Implement updates** via EAS Update (for OTA updates without new APK)

---

## Support

- **Railway Docs**: https://docs.railway.app
- **EAS Docs**: https://docs.expo.dev/build/introduction/
- **Expo Forums**: https://forums.expo.dev
- **Gemini API Docs**: https://ai.google.dev/docs

For project-specific issues, check the main README.md or create an issue in your repository.
