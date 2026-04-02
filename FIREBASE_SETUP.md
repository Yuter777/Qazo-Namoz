# Firebase Configuration Setup Guide

## Error: `Firebase: Error (auth/invalid-api-key)`

This error occurs when Firebase is not properly configured with valid API keys.

## Solution Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Register Your Web App

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "QazoNamaz Web")
5. Copy the Firebase configuration object

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Firebase configuration values:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIzaSyD... (your actual API key)
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
   ```

### 4. Enable Authentication (Optional)

If you want to use Google Authentication:

1. In Firebase Console, go to Authentication
2. Click "Get Started"
3. Enable "Google" sign-in method
4. Add your domain to authorized domains (for production)

### 5. Restart Development Server

After updating `.env`, restart your development server:

```bash
npm run dev
```

## Important Notes

- **Never commit `.env` to version control** - it contains sensitive API keys
- The `.env` file is already in `.gitignore` for security
- If you need to share configuration with team members, share `.env.example` only
- Each developer should create their own `.env` file with their Firebase project credentials

## Troubleshooting

### Still getting `invalid-api-key` error?

1. Verify all required environment variables are set in `.env`
2. Check for typos in variable names (must start with `VITE_`)
3. Ensure there are no extra spaces or quotes around values
4. Restart the dev server after changing `.env`
5. Check browser console for more detailed error messages

### Check if environment variables are loaded

Add this temporary code to `src/main.js` to debug:

```javascript
console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Loaded' : 'Missing');
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
```

## Security Best Practices

1. Use environment variables for all sensitive configuration
2. Set up Firebase App Check for production
3. Configure proper security rules in Firestore
4. Restrict API key usage in Google Cloud Console
5. Use different Firebase projects for development and production