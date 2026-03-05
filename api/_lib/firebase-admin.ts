import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
      });
    } else {
      // Fallback for environment where service account is not provided as JSON
      admin.initializeApp({
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
      });
    }
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

export const adminDb = admin.database();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export default admin;
