
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/auth/auth-layout';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HotelLoginPage() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hotelId) {
        setError('Ungültiger Login-Link. Der hotelId-Parameter fehlt.');
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password, 'hotelier', hotelId);
      router.push(`/dashboard/${hotelId}`);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Ungültige E-Mail-Adresse oder falsches Passwort.');
          break;
        case 'auth/invalid-email':
          setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
          break;
        case 'permission-denied':
           setError('Sie haben keine Berechtigung für dieses Hotel-Dashboard.');
           break;
        default:
          setError('Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
          console.error(err);
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };


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
          {!hotelId && !error && (
             <Alert variant="destructive" className="mb-4">
                <AlertTitle>Ungültiger Link</AlertTitle>
                <AlertDescription>
                    Bitte verwenden Sie den speziellen Login-Link, den Sie von Ihrer Agentur erhalten haben.
                </AlertDescription>
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
                disabled={isLoading || !hotelId}
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
                disabled={isLoading || !hotelId}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !hotelId}>
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

