# Fix Firebase Storage CORS Error

You're getting a CORS error when uploading images from GitHub Pages. This is because Firebase Storage security rules need to allow uploads from your domain.

## Fix: Update Firebase Storage Rules

1. Go to: https://console.firebase.google.com/project/portfolio-db982/storage/rules

2. Replace the rules with these (allows uploads from GitHub Pages):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{allPaths=**} {
      allow read: if true;
      allow write: if true; // Allow writes from any origin (for GitHub Pages)
    }
    match /profile/{allPaths=**} {
      allow read: if true;
      allow write: if true; // Allow writes from any origin (for GitHub Pages)
    }
  }
}
```

3. Click "Publish"

## Why This Happens

- Firebase Storage has CORS restrictions
- GitHub Pages (`sentan1.github.io`) needs permission to upload
- The security rules control who can upload

## Security Note

These rules allow anyone to upload. For better security later:
- Set up Firebase Authentication
- Or use Firebase App Check to limit to your domain

After updating the rules, try uploading an image again from GitHub Pages. It should work!

