# Fix: Firebase Authentication Error (auth/configuration-not-found)

This error means Firebase Authentication isn't enabled in your Firebase project. Follow these steps:

## Step 1: Enable Firebase Authentication

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/project/portfolio-db982/authentication

2. **If you see "Get started" button:**
   - Click "Get started"
   - This enables Authentication for your project

3. **Click on "Sign-in method" tab** (left sidebar)

4. **Enable Email/Password:**
   - Find "Email/Password" in the list
   - Click on it
   - Toggle "Enable" to ON
   - Click "Save"

## Step 2: Create Your Admin User

1. **Go to "Users" tab** (left sidebar in Authentication section)

2. **Click "Add user"** button (top right)

3. **Enter your credentials:**
   - **Email**: `adrian@anda.land`
   - **Password**: `Huh???2006`
   - **Click "Add user"**

4. **User created!** You should see `adrian@anda.land` in the users list

## Step 3: Test Login

1. **Go back to your portfolio site**
2. **Click "Admin" button**
3. **Enter:**
   - Email: `adrian@anda.land`
   - Password: `Huh???2006`
4. **Click "Login"**
5. **You should be logged in!**

## Step 4: Update Security Rules (Important!)

After creating the user, make sure your security rules allow authenticated users to write:

### Firestore Rules:
1. Go to: https://console.firebase.google.com/project/portfolio-db982/firestore/rules
2. Make sure rules allow authenticated writes:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolio/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules:
1. Go to: https://console.firebase.google.com/project/portfolio-db982/storage/rules
2. Make sure rules allow authenticated writes:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /profile/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

**Still getting "configuration-not-found" error?**
- Make sure you clicked "Get started" in Authentication section
- Make sure Email/Password is enabled in Sign-in methods
- Refresh your browser and try again
- Check browser console for more detailed error messages

**"User not found" error?**
- Make sure you created the user with email `adrian@anda.land`
- Check the Users tab to verify the user exists

**"Invalid password" error?**
- Make sure you're using the exact password: `Huh???2006`
- Check for typos (case-sensitive)

## Quick Checklist

- [ ] Authentication enabled in Firebase Console
- [ ] Email/Password sign-in method enabled
- [ ] User `adrian@anda.land` created in Users tab
- [ ] Security rules updated to allow authenticated writes
- [ ] Tried logging in with `adrian@anda.land` / `Huh???2006`

Once all these are done, the login should work!

