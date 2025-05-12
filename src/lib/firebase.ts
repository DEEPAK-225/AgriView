// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
// import { getAuth, type Auth } from 'firebase/auth'; // Optional: if you need auth

// Import the config
import firebaseConfigFromFile from './firebase.config'; // Changed to import .ts file


let app: FirebaseApp | null = null;
let database: Database | null = null;
// let auth: Auth | null = null; // Optional: if you need auth

// Directly use the imported config, assuming it's always provided for this setup
const firebaseConfig = firebaseConfigFromFile;

// Basic check for essential config values from firebaseConfig
if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId || !firebaseConfig.databaseURL) {
    const message = `Essential Firebase configuration values (apiKey, projectId, appId, databaseURL) are missing or empty in the imported firebaseConfig. ` +
                    `Please check your src/lib/firebase.config.ts file. Firebase functionality will be disabled.`;
    console.warn(message);
    app = null;
    database = null;
} else {
  // All required configuration values are present, attempt to initialize Firebase
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully from firebase.config.ts.");
    } else {
      app = getApp();
      console.log("Firebase app re-used successfully.");
    }
    database = getDatabase(app);
    console.log("Firebase Realtime Database instance obtained successfully.");
    // auth = getAuth(app); // Optional: Initialize auth if needed
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    // Ensure app, database (and auth) are null if initialization fails
    app = null;
    database = null;
    // auth = null;
  }
}

export { app, database /*, auth */ }; // Export auth if needed
