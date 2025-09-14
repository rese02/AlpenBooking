
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/auth/auth-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { createSession } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';

export default function AgencyLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);
  const { user, loading: authLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Securely sign in on the client
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Step 2: Get the ID token from the logged-in user
      const idToken = await userCredential.user.getIdToken(true);
      
      // Step 3: Send the token to the server to create a session cookie
      await createSession(idToken);
      
      // Step 4: Redirect to the admin dashboard on success
      router.push('/admin');

    } catch (err: any) {
      console.error("Login-Fehler:", err);
      if (err.code?.includes('auth/')) {
        setError('Ungültige E-Mail oder falsches Passwort.');
      } else {
        setError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // If user is already logged in, redirect them away from login page
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
          <CardDescription>Melden Sie sich an, um auf das Dashboard zuzugreifen.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Login fehlgeschlagen</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="agentur@mail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
