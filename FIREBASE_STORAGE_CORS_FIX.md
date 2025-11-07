# Fix Firebase Storage CORS Error for GitHub Pages

The CORS error happens because Firebase Storage needs to allow uploads from `sentan1.github.io`.

## Solution: Configure CORS in Google Cloud Storage

Firebase Storage uses Google Cloud Storage, so CORS needs to be configured there.

### Option 1: Using Google Cloud Console (Easiest)

1. Go to: https://console.cloud.google.com/storage/browser?project=portfolio-db982
2. Click on your bucket (should be `portfolio-db982.firebasestorage.app`)
3. Go to **Configuration** tab
4. Scroll to **CORS configuration**
5. Click **Edit CORS configuration**
6. Add this configuration:

```json
[
  {
    "origin": ["https://sentan1.github.io", "http://localhost:8080"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

7. Click **Save**

### Option 2: Using gsutil (Command Line)

If you have gsutil installed:

1. Create a file `cors.json`:
```json
[
  {
    "origin": ["https://sentan1.github.io", "http://localhost:8080"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

2. Run:
```bash
gsutil cors set cors.json gs://portfolio-db982.firebasestorage.app
```

### Option 3: Temporary Workaround

If CORS configuration is too complex, the code now uses `uploadBytes` which should work better. But if it still fails, you can:

1. Use smaller images (under 500KB after compression)
2. The code will fallback to storing in Firestore if Storage fails (but this is not ideal)

## After Configuring CORS

1. Wait a few minutes for changes to propagate
2. Try uploading an image again from GitHub Pages
3. It should work!

## Verify It's Working

After configuring CORS, you should see in the console:
- `Uploaded image X for project Y using uploadBytes`
- No CORS errors

