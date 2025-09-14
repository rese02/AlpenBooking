
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/components/auth/auth-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { createSession } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';

export default function AgencyLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);
  const { user, loading: authLoading } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    // Hardcoded credentials for development one-click login
    const email = 'hallo@agentur-weso.it';
    const password = 'Hallo-weso.2025!';

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken(true);
      await createSession(idToken);
      router.push('/admin');
    } catch (err: any) {
      console.error("Login-Fehler:", err);
      if (err.code?.includes('auth/')) {
        setError('Automatischer Login fehlgeschlagen. Stellen Sie sicher, dass der Demo-Benutzer (hallo@agentur-weso.it) mit dem korrekten Passwort in Firebase existiert und die "agency"-Rolle hat.');
      } else {
        setError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!authLoading && user) {
      router.replace('/admin');
      return (
         <div className="flex h-screen w-full items-center justify-center">
            <p>Sie sind bereits eingeloggt. Leite weiter...</p>
        </div>
      );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Agentur-Login</CardTitle>
          <CardDescription>Entwicklungsmodus</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Login fehlgeschlagen</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
             <p className="text-sm text-center text-muted-foreground">Klicken Sie, um sich als Agentur-Administrator anzumelden.</p>
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Als Agentur-Admin einloggen
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
