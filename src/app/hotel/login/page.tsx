
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/auth/auth-layout';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { createSession } from '@/lib/auth-actions';
import { useAuth } from '@/contexts/auth-context';

export default function HotelLoginPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const { user, claims, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If auth is done loading and the user is a logged-in hotelier, redirect them.
    if (!authLoading && user && claims?.role === 'hotelier' && claims?.hotelId) {
      router.replace(`/dashboard/${claims.hotelId}`);
    }
  }, [authLoading, user, claims, router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      // Security Check: Does the logged-in user have the 'hotelier' role and a 'hotelId'?
      if (tokenResult.claims.role !== 'hotelier' || !tokenResult.claims.hotelId) {
        throw new Error('Sie haben keine Berechtigung für den Zugriff auf ein Hotel-Dashboard.');
      }
      
      await createSession(tokenResult.token);
      // Let the useEffect hook handle the redirection after the auth state is updated.
      // We explicitly push the route here to make it faster.
      router.push(`/dashboard/${tokenResult.claims.hotelId}`);

    } catch (err: any) {
      console.error("Login-Fehler:", err);
      if (err.code?.includes('auth/')) {
        setError('Login fehlgeschlagen. Überprüfen Sie E-Mail und Passwort.');
      } else {
        setError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // While checking auth or if the user is already logged in and being redirected, show a loading state.
  if (authLoading || (!authLoading && user && claims?.hotelId)) {
      return (
         <AuthLayout>
             <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Sie werden eingeloggt...</p>
            </div>
         </AuthLayout>
      );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Hotel-Login</CardTitle>
          <CardDescription>Melden Sie sich an, um auf das Dashboard Ihres Hotels zuzugreifen.</CardDescription>
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
                placeholder="hotelier@mail.com" 
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
            
             <div className="text-center text-sm">
                <Link href="#" className="underline text-muted-foreground">
                    Passwort vergessen?
                </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
