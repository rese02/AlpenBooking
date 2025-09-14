// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Check if the service account key is available in environment variables
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Provide a more helpful error message in the console
  console.error("CRITICAL ERROR: 'FIREBASE_SERVICE_ACCOUNT_KEY' is not set in the environment variables.");
  console.error("Please ensure your .env.local file contains the service account key and the server is restarted.");
  throw new Error('Firebase service account key is not set in environment variables.');
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (e) {
    console.error("CRITICAL ERROR: Failed to parse 'FIREBASE_SERVICE_ACCOUNT_KEY'. Make sure it's a valid JSON string.");
    throw new Error("Failed to parse Firebase service account key.");
}


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
