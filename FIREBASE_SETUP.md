# Firebase Setup Guide

This guide will help you set up Firebase so your portfolio changes are visible to everyone!

## Firebase Free Tier Limits

- **Firestore Database**: 1 GB storage, 50K reads/day, 20K writes/day
- **Storage (for images)**: 5 GB storage, 1 GB/day downloads
- **Perfect for portfolios!** This is way more than enough.

## Setup Steps

### 1. Create Firebase Account
1. Go to https://console.firebase.google.com/
2. Sign in with your Google account
3. Click "Add project" or "Create a project"

### 2. Create Firebase Project
1. Enter project name: `improved-portfolio` (or any name you like)
2. Disable Google Analytics (optional, not needed)
3. Click "Create project"
4. Wait for project to be created, then click "Continue"

### 3. Add Web App
1. In your Firebase project, click the **Web icon** (`</>`)
2. Register app nickname: `portfolio-web` (or any name)
3. **Don't check** "Also set up Firebase Hosting"
4. Click "Register app"
5. **Copy the config values** - you'll need these!

### 4. Enable Firestore Database
1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Select **"Start in test mode"** (we'll set up proper rules in step 7)
4. Choose a location (closest to you)
5. Click "Enable"

### 5. Enable Storage
1. In Firebase Console, go to **Build** > **Storage**
2. Click "Get started"
3. Select **"Start in test mode"** (we'll set up proper rules in step 8)
4. Use the default location
5. Click "Done"

### 6. Add Environment Variables
1. In your project root, create a file named `.env` (not `.env.example`)
2. Copy the template from `.env.example` (if it exists) or use this format:
3. Replace the values with your Firebase config from step 3:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Important:** 
- The `.env` file is already in `.gitignore` so it won't be committed to git
- After creating `.env`, **restart your dev server** (`npm run dev`)
- All variables must start with `VITE_` for Vite to expose them

### 7. Set Up Firestore Security Rules (IMPORTANT!)
**Do this now!** Test mode expires after 30 days. Set up these rules immediately:

1. Go to **Firestore Database** > **Rules**
2. Replace the rules with these (allows public reads and writes for your portfolio):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to everyone
    // Allow write access to everyone (for personal portfolio)
    match /portfolio/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Security Note:** These rules allow anyone to edit your portfolio. For better security:
- Set up Firebase Authentication
- Or restrict writes to authenticated users only
- Or use Firebase App Check to limit access

3. Click "Publish"

### 8. Set Up Storage Security Rules (IMPORTANT!)
**Do this now!** Test mode expires after 30 days. Set up these rules immediately:

1. Go to **Storage** > **Rules**
2. Replace the rules with these (allows public reads and writes):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{allPaths=**} {
      allow read, write: if true;
    }
    match /profile/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**Security Note:** These rules allow anyone to upload/delete images. For better security, set up Firebase Authentication.

3. Click "Publish"

### 9. Test It!
1. Restart your dev server: `npm run dev`
2. Add a project in admin mode
3. Check Firebase Console > Firestore Database - you should see your data!
4. Open the site in an incognito window - you should see the same projects!

## How It Works

- **Without Firebase**: Changes only save to your browser (localStorage)
- **With Firebase**: Changes save to the cloud, everyone sees them!

The app automatically:
- Tries Firebase first (if configured)
- Falls back to localStorage if Firebase isn't set up
- Syncs data from Firebase to localStorage as backup

## Troubleshooting

**"Firebase not configured" in console?**
- Make sure `.env` file exists (not just `.env.example`)
- Restart dev server after creating `.env`
- Check that all environment variables start with `VITE_`

**Can't see changes on other devices?**
- Make sure Firebase is configured
- Check browser console for errors
- Verify Firestore rules allow reads

**Storage quota exceeded?**
- Firebase free tier is generous, but if you hit limits:
  - Upgrade to Blaze plan (pay-as-you-go, still free for small usage)
  - Or optimize images more

## Next Steps

Once Firebase is set up:
1. Your changes will be visible to everyone!
2. Data persists even if you clear browser cache
3. Works across all devices and browsers
4. Much more storage than localStorage!


