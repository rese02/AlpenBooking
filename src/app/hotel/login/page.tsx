
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/auth/auth-layout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function HotelLoginPage() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotelId');

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Hotel-Login</CardTitle>
          <CardDescription>Melden Sie sich an, um auf das Dashboard Ihres Hotels zuzugreifen.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" placeholder="hotelier@mail.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild={!!hotelId} disabled={!hotelId}>
              {hotelId ? (
                <Link href={`/dashboard/${hotelId}`}>Anmelden</Link>
              ) : (
                <span>Anmelden</span>
              )}
            </Button>
            {!hotelId && (
                <p className="text-xs text-center text-destructive">
                    Ungültiger Login-Link. Bitte verwenden Sie den von Ihrer Agentur bereitgestellten Link.
                </p>
            )}
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
