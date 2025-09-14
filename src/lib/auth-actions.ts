
'use server';
import { config } from 'dotenv';
config();

import { auth as adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Eine benutzerdefinierte Fehlerklasse für Authentifizierungsfehler
class AuthError extends Error {
  constructor(message = 'Authentication error') {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Erstellt eine Server-Session für einen Benutzer, nachdem dessen ID-Token validiert wurde.
 * Crucially, it verifies the user has the 'agency' role before creating the session.
 * @param idToken The Firebase ID token from the client.
 * @returns A promise that resolves on success or throws an error on failure.
 */
export async function createSession(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (decodedToken.role !== 'agency') {
      throw new AuthError('Sie haben nicht die erforderliche "agency"-Rolle für den Zugriff.');
    }
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 Tage
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });

  } catch (error) {
    console.error('Fehler bei der Session-Erstellung:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new Error('Sitzung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.');
  }
}


/**
 * Löscht das Session-Cookie und leitet den Benutzer zur Startseite weiter.
 */
export async function removeSession() {
  cookies().delete('session');
  redirect('/');
}
