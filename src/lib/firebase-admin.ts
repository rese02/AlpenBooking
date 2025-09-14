
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const SERVICE_ACCOUNT_FILE = 'serviceAccountKey.json';

// This is the ONE and ONLY way the Admin SDK is initialized.
// It directly reads the JSON file from the project root.
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.resolve(process.cwd(), SERVICE_ACCOUNT_FILE);
    
    if (!fs.existsSync(serviceAccountPath)) {
        console.error(`\nCRITICAL ERROR: Die Service-Account-Datei '${SERVICE_ACCOUNT_FILE}' wurde nicht im Hauptverzeichnis gefunden.`);
        console.error("Bitte laden Sie sie von Ihren Firebase-Projekteinstellungen > Dienstkonten herunter und legen Sie sie dort ab.\n");
        throw new Error(`Service account file not found at ${serviceAccountPath}`);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

  } catch (error) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initialization failed.', error);
    // We throw an error to halt the process if the admin SDK can't be initialized.
    throw new Error('Could not initialize Firebase Admin SDK.');
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
