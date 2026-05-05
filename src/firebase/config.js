import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// TODO: Replace with your actual Firebase project configuration
// Get these values from: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required configuration
const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(
    "Firebase Configuration Error: Missing required environment variables:\n" +
      missingKeys
        .map(
          (key) =>
            `  - VITE_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`
        )
        .join("\n") +
      "\n\nPlease create a .env file in the project root with your Firebase configuration.\n" +
      "See .env.example for the required format.\n" +
      "You can get these values from: https://console.firebase.google.com/"
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
