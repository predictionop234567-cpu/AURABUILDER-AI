import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "placeholder-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder-auth-domain",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://placeholder-db.firebaseio.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project-id",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder-storage-bucket",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder-sender-id",
  appId: process.env.VITE_FIREBASE_APP_ID || "placeholder-app-id"
};

let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create a dummy app if initialization fails to prevent crashes in components
  app = initializeApp({ ...firebaseConfig, apiKey: "dummy" });
}

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
