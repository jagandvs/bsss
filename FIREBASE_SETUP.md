# Firebase Setup Guide

This guide will walk you through creating and configuring Firebase for the AMIC Matrimonial Profiles App.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "amic-matrimonial-app")
4. Click **"Continue"**
5. (Optional) Disable Google Analytics if you don't need it, or enable it
6. Click **"Create project"**
7. Wait for the project to be created, then click **"Continue"**

## Step 2: Register Your Web App

1. In the Firebase Console, click the **Web icon** (`</>`) or **"Add app"** → **"Web"**
2. Register your app:
   - App nickname: "AMIC Web App" (or any name you prefer)
   - (Optional) Check "Also set up Firebase Hosting"
   - Click **"Register app"**
3. You'll see your Firebase configuration object. **Copy these values** - you'll need them in Step 4.

## Step 3: Enable Firestore Database

1. In the Firebase Console sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - ⚠️ **Important**: This allows read/write access to anyone. We'll secure it in Step 6.
4. Select a location for your database (choose the closest to your users)
5. Click **"Enable"**
6. Wait for Firestore to initialize

## Step 4: Configure Your App

1. Navigate to your project directory:
   ```bash
   cd amic-app
   ```

2. Create the `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` in your editor and add your Firebase configuration values:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   **Where to find these values:**
   - Go to Firebase Console → Project Settings (gear icon) → General tab
   - Scroll down to "Your apps" section
   - Click on the web app you created
   - You'll see the config object with all values

   Example:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",           // → VITE_FIREBASE_API_KEY
     authDomain: "amic-app.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
     projectId: "amic-app",           // → VITE_FIREBASE_PROJECT_ID
     storageBucket: "amic-app.appspot.com",   // → VITE_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "123456789",  // → VITE_FIREBASE_MESSAGING_SENDER_ID
     appId: "1:123456789:web:abc123" // → VITE_FIREBASE_APP_ID
   };
   ```

## Step 5: Test Your Configuration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser (usually `http://localhost:5173`)
3. Try creating a profile:
   - Click "Create New Profile"
   - Fill in the required fields
   - Click "Create Profile"
4. Check Firebase Console → Firestore Database to see if the document was created

## Step 6: Set Up Firestore Security Rules (Important!)

For production, you should secure your Firestore database:

1. In Firebase Console, go to **"Build"** → **"Firestore Database"** → **"Rules"** tab
2. Replace the default rules with one of these options:

### Option A: Development Rules (Open Access - NOT for production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Option B: Production Rules (Recommended - Requires Authentication)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{document=**} {
      // Allow read and write only if authenticated
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note**: This requires users to be logged in to access any data. This is the recommended approach for the app.

3. Click **"Publish"** to save the rules

## Step 7: Set Up Firebase Authentication

**This is required for the app to work properly:**

1. In Firebase Console, go to **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Enable **"Email/Password"** (toggle it ON)
6. **Important**: Disable **"Enable Email link (passwordless sign-in)"** if you don't need it
7. Click **"Save"**

### Creating User Accounts

**Only administrators can create user accounts:**

1. Go to Firebase Console → **"Authentication"** → **"Users"** tab
2. Click **"Add user"**
3. Enter the user's email and password
4. Click **"Add user"**

Users will then be able to log in using their email and password.

**Important**: Update your Firestore rules to require authentication (see Step 6, Option B above)

## Troubleshooting

### "Firebase: Error (auth/api-key-not-valid)"
- Check that your `.env` file has the correct API key
- Make sure the `.env` file is in the root of `amic-app` directory
- Restart the dev server after changing `.env`

### "Missing or insufficient permissions"
- Check your Firestore security rules
- Make sure you've published the rules
- For development, use Option A rules above

### "Firebase App named '[DEFAULT]' already exists"
- This usually means Firebase is initialized multiple times
- Check that you're only calling `initializeApp` once in `firebase.ts`

### Data not appearing in Firestore
- Check the browser console for errors
- Verify your Firestore rules allow write access
- Make sure you're looking at the correct project in Firebase Console

## Next Steps

Once Firebase is configured:

1. ✅ Test creating a profile
2. ✅ Test viewing the list
3. ✅ Test searching profiles
4. ✅ Test printing a profile
5. ✅ Deploy to production (Netlify, Vercel, or Firebase Hosting)

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

