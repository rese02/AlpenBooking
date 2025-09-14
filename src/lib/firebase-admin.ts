
// src/lib/firebase-admin.ts
import '@/lib/env'; // Load environment variables first
import admin from 'firebase-admin';

// Check if the service account key is available in environment variables
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  throw new Error('Firebase service account key is not set in environment variables.');
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
