
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/components/auth/auth-layout';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { createSession } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';

export default function AgencyLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, claims, loading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if the user is already logged in as an agency
    if (!authLoading && user && claims?.role === 'agency') {
      router.replace('/admin');
    }
  }, [authLoading, user, claims, router]);

  const handleOneClickLogin = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      // Directly sign in with the agency credentials
      const userCredential = await signInWithEmailAndPassword(auth, 'hallo@agentur-weso.it', 'Hallo-weso.2025!');
      const idToken = await userCredential.user.getIdToken(true);
      
      // Create server-side session
      await createSession(idToken);
      
      // After session creation, the useEffect will handle redirection
      // or we can force it if needed.
      router.push('/admin');

    } catch (error) {
      console.error("One-click login failed:", error);
      // Optionally, show an error to the user
      setIsLoading(false);
    }
  };

  // Show a loading state while checking auth or if user is already logged in and redirecting
  if (authLoading || (user && claims?.role === 'agency')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Sie werden eingeloggt...</p>
      </div>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Agentur-Login</CardTitle>
          <CardDescription>Melden Sie sich mit einem Klick an, um auf das Agentur-Dashboard zuzugreifen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOneClickLogin} className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Als Agentur-Admin einloggen
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
