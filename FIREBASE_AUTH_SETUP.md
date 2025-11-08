# Firebase Authentication Setup

I've updated your code to use Firebase Authentication, which means:
- ✅ **Password is stored server-side** (not in JavaScript code!)
- ✅ **Password is truly hidden** from page source
- ✅ **Real authentication system**

## Setup Steps

### 1. Enable Firebase Authentication

1. Go to: https://console.firebase.google.com/project/portfolio-db982/authentication
2. Click "Get started"
3. Click "Email/Password" 
4. Enable "Email/Password" (first option)
5. Click "Save"

### 2. Create Admin User

1. Still in Authentication section
2. Click "Users" tab
3. Click "Add user"
4. Enter:
   - **Email**: `adrian@anda.land` (this is your admin email)
   - **Password**: Your secure password (e.g., `Huh???2006` or something stronger)
5. Click "Add user"

### 3. Update Security Rules (Important!)

After creating the user, update your Firestore and Storage rules to require authentication:

#### Firestore Rules:
1. Go to: https://console.firebase.google.com/project/portfolio-db982/firestore/rules
2. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolio/{document=**} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

#### Storage Rules:
1. Go to: https://console.firebase.google.com/project/portfolio-db982/storage/rules
2. Replace with:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{allPaths=**} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null; // Only authenticated users can write
    }
    match /profile/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Test It!

1. Restart your dev server: `npm run dev`
2. Click "Admin" button
3. Enter:
   - **Email**: `adrian@anda.land`
   - **Password**: The password you set in Firebase
4. You should be logged in!

## What Changed

- ✅ Password is now **server-side** (truly hidden!)
- ✅ No password in JavaScript code
- ✅ Real authentication system
- ✅ More secure

## Important Notes

- The email/password you create in Firebase Console is what you'll use to login
- The password is stored securely by Firebase (not in your code)
- Only authenticated users can edit your portfolio
- Anyone can still view your portfolio (read access)

Your password is now truly hidden! 🎉

