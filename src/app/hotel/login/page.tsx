
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/auth/auth-layout';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';

export default function HotelLoginPage() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const [error, setError] = useState<string | null>(null);


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
                    Bitte verwenden Sie den speziellen Login-Link, den Sie von Ihrer Agentur erhalten haben. Die Login-Funktion für Hoteliers ist derzeit in Entwicklung.
                </AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="hotelier@mail.com" 
                required 
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                disabled={true}
              />
            </div>
            <Button type="submit" className="w-full" disabled={true}>
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
