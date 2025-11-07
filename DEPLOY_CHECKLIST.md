# GitHub Pages Deployment Checklist

## Before Deploying to GitHub Pages

### ✅ 1. Firebase Setup (Required)
- [x] Firestore Database enabled (Standard mode - FREE)
- [ ] **Firebase Storage enabled** (for project images)
- [ ] Firestore Security Rules set up (prevents 30-day expiration)
- [ ] Storage Security Rules set up

### ✅ 2. Enable Firebase Storage
1. Go to: https://console.firebase.google.com/project/portfolio-db982/storage
2. Click "Get started"
3. Select "Start in test mode"
4. Click "Done"

### ✅ 3. Set Up Storage Security Rules
1. Go to: https://console.firebase.google.com/project/portfolio-db982/storage/rules
2. Replace with:
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
3. Click "Publish"

### ✅ 4. Build and Deploy
```bash
npm run build
npm run deploy
```

### ✅ 5. Test on GitHub Pages
1. Wait a few minutes for deployment
2. Go to: https://Sentan1.github.io/Improved-Portfolio/
3. Test adding a project
4. Check Firebase Console to verify data saved

## Common Issues

**Error adding projects locally?**
- Make sure Firebase Storage is enabled
- Check browser console (F12) for specific error
- Verify security rules are published

**Not working on GitHub Pages?**
- Firebase config is already in the code (with fallbacks)
- Just need to build and deploy
- Make sure Storage is enabled in Firebase Console

## What's Already Done ✅
- Firebase config included in code (works on GitHub Pages)
- Firestore integration complete
- Storage integration complete
- Build process configured

