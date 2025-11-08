# How to Deploy Changes to GitHub Pages

## Quick Steps

1. **Commit your changes** (if not already done):
   ```bash
   git add .
   git commit -m "Update hero text to Project showcase"
   ```

2. **Push to GitHub**:
   ```bash
   git push origin main
   ```

3. **Wait for GitHub Actions** (2-5 minutes):
   - Go to: https://github.com/Sentan1/Improved-Portfolio/actions
   - Look for the latest workflow run
   - Wait for it to complete (green checkmark)

4. **Clear browser cache**:
   - Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or open in incognito/private window

5. **Check your site**:
   - Visit: https://sentan1.github.io/Improved-Portfolio
   - Changes should appear!

## Troubleshooting

**Changes still not showing?**
- Check GitHub Actions tab - did the workflow succeed?
- Try hard refresh: `Ctrl + F5` or `Cmd + Shift + R`
- Wait a few more minutes (deployment can take 5-10 minutes)
- Check if you're on the right branch (should be `main`)

**GitHub Actions failed?**
- Check the Actions tab for error messages
- Make sure all Firebase secrets are set in GitHub Settings → Secrets

