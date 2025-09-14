
// HINWEIS: Dieses Skript wird manuell ausgeführt, um Benutzerrollen zu setzen.
// Es ist NICHT Teil der Next.js-Anwendung.
// Sie führen es aus mit: npx ts-node src/lib/user-roles.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// ===== ZU KONFIGURIERENDE WERTE =====
const userEmail = "hallo@agentur-weso.it";
const role: 'agency' | 'hotelier' = "agency"; 
  
// Nur für 'hotelier'-Rolle ausfüllen, sonst leer lassen
const hotelId = ""; 
// ======================================

async function setUserRole() {
  
  // 1. Prüfen, ob die Service-Account-Datei existiert
  const serviceAccountPath = path.resolve('./serviceAccountKey.json');
  if (!fs.existsSync(serviceAccountPath)) {
      console.error("\nFEHLER: Die Datei 'serviceAccountKey.json' wurde nicht gefunden.");
      console.error("Bitte laden Sie sie von Ihren Firebase-Projekteinstellungen > Dienstkonten herunter und speichern Sie sie im Hauptverzeichnis des Projekts.\n");
      process.exit(1);
  }

  // 2. Firebase Admin initialisieren
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  initializeApp({
    credential: cert(serviceAccount),
  });
  
  // 3. Logik-Prüfung: Nur bei 'hotelier' die hotelId prüfen
  if (role === 'hotelier' && !hotelId) {
    console.error("\nFEHLER: Für die Rolle 'hotelier' muss eine 'hotelId' angegeben werden.\n");
    process.exit(1);
  }

  try {
    // 4. Benutzer holen
    const user = await getAuth().getUserByEmail(userEmail);
    
    // 5. Claims (Rollen) vorbereiten
    const claims: { [key: string]: any } = { role: role };
    if (role === 'hotelier') {
      claims.hotelId = hotelId;
    }

    // 6. Claims setzen
    await getAuth().setCustomUserClaims(user.uid, claims);
    
    console.log(`\nErfolg! Benutzer '${userEmail}' (UID: ${user.uid}) hat jetzt folgende Claims:`, claims);
    console.log("Die Änderungen können einige Minuten dauern, bis sie überall wirksam sind.\n");

  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
        console.error(`\nFEHLER: Der Benutzer mit der E-Mail '${userEmail}' wurde in Firebase Authentication nicht gefunden.\n`);
    } else {
        console.error("\nFehler beim Setzen der Benutzerrolle:", error.message);
    }
  }
}

setUserRole().finally(() => process.exit());
