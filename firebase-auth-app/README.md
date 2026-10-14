# Firebase Authentication & Hosting Project

This project demonstrates **Firebase Authentication** (Email/Password & Google Sign-In) hosted on **Firebase Hosting**.

## Project Structure
```
firebase-auth-app/
├── firebase.json       # Firebase Hosting config
└── public/
    ├── index.html      # UI (Sign In, Sign Up, Dashboard)
    ├── style.css       # Clean responsive styles
    └── app.js          # Firebase Auth logic (v10 modular SDK)
```

## Quick Start Guide

### 1. Enable Authentication in Firebase Console
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (e.g. `doomscrollx-27`, `mode-9925f`, `watch-5282d`, or create a new one).
3. In the left sidebar, click **Build > Authentication**.
4. Click **Get Started**.
5. Under the **Sign-in method** tab:
   - Enable **Email/Password**.
   - Enable **Google** (select your support email and save).

### 2. Copy Firebase Web App Config
1. Go to **Project Settings** (gear icon next to Project Overview).
2. Under **General**, scroll to **Your apps**.
3. If no web app exists, click the web icon `</>` to register one.
4. Copy the `firebaseConfig` snippet.
5. Open `public/app.js` and paste your keys into `const firebaseConfig = { ... }`.

### 3. Associate with your Firebase Project
Open terminal in this folder (`firebase-auth-app`) and set your active project:
```bash
firebase use --add
```
(Select your Firebase project from the list)

### 4. Test Locally
Run a local emulator:
```bash
firebase serve
```
Or test in browser by visiting `http://localhost:5000`.

### 5. Deploy to Firebase Hosting
Deploy your application with:
```bash
firebase deploy --only hosting
```
Once deployed, Firebase CLI will provide the live Hosting URL (e.g., `https://<your-project-id>.web.app`).
