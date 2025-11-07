# Setting Up Firebase for GitHub Pages

Your portfolio needs Firebase configuration to work on GitHub Pages. Here's how to set it up:

## Option 1: GitHub Actions with Secrets (Recommended)

This is the secure way to deploy with Firebase.

### Step 1: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/Sentan1/Improved-Portfolio
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of these secrets (copy from your `.env` file):

   - **Name:** `VITE_FIREBASE_API_KEY`  
     **Value:** `AIzaSyBHHUAqIR7erJxg_OtQDRjbQD6B-owl4d8`

   - **Name:** `VITE_FIREBASE_AUTH_DOMAIN`  
     **Value:** `portfolio-db982.firebaseapp.com`

   - **Name:** `VITE_FIREBASE_PROJECT_ID`  
     **Value:** `portfolio-db982`

   - **Name:** `VITE_FIREBASE_STORAGE_BUCKET`  
     **Value:** `portfolio-db982.firebasestorage.app`

   - **Name:** `VITE_FIREBASE_MESSAGING_SENDER_ID`  
     **Value:** `137456975079`

   - **Name:** `VITE_FIREBASE_APP_ID`  
     **Value:** `1:137456975079:web:f3a83438c07125bea2b642`

### Step 2: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
3. Save

### Step 3: Deploy

1. Push your code to the `main` branch (or your default branch)
2. GitHub Actions will automatically build and deploy
3. Check the **Actions** tab to see the deployment progress

## Option 2: Simple Fallback (Alternative)

If you prefer not to use GitHub Actions, you can add a fallback in the code. Since Firebase config values are public anyway (security comes from Firebase Security Rules), this is safe.

See `FIREBASE_FALLBACK.md` for this approach.

## How It Works

- **Local development:** Uses `.env` file
- **GitHub Pages:** Uses GitHub Secrets injected during build
- **Both:** Connect to the same Firebase project, so data syncs!

## Troubleshooting

**Firebase not working on GitHub Pages?**
- Make sure all 6 secrets are added
- Check the Actions tab for build errors
- Verify GitHub Pages is set to use "GitHub Actions" as source

**Changes not showing?**
- Make sure you've pushed to the main branch
- Wait for the GitHub Actions workflow to complete
- Clear your browser cache

