
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'agency' | 'hotelier';
  loginPath: string;
  requiredHotelId?: string;
}

export default function ProtectedRoute({ children, requiredRole, loginPath, requiredHotelId }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) {
      return; // Wait until authentication status is resolved
    }

    if (!user) {
      router.replace(loginPath);
      return;
    }

    const checkAuthorization = async () => {
        try {
            // Force refresh the token to get the latest custom claims. This is the crucial part.
            const tokenResult = await user.getIdTokenResult(true);
            const claims = tokenResult.claims;
            const userRole = claims.role;

            if (userRole !== requiredRole) {
                console.warn(`Access denied. User role: "${userRole}", Required role: "${requiredRole}"`);
                // If role is wrong, log out and redirect
                await auth.signOut();
                router.replace(loginPath);
                return;
            }

            if (requiredRole === 'hotelier') {
                const userHotelId = claims.hotelId;
                if (userHotelId !== requiredHotelId) {
                    console.warn(`Access denied. User hotelId: "${userHotelId}", Required hotelId: "${requiredHotelId}"`);
                    // If hotelId is wrong, log out and redirect
                    await auth.signOut();
                    router.replace(loginPath);
                    return;
                }
            }
            // If all checks pass, user is authorized
            setIsAuthorized(true);

        } catch (error) {
            console.error("Error verifying user token:", error);
            // On any token error, log out and redirect
            await auth.signOut();
            router.replace(loginPath);
        }
    };

    checkAuthorization();

  }, [user, loading, router, loginPath, requiredRole, requiredHotelId]);

  if (loading || !isAuthorized) {
    // Show a loading state while checking auth and redirecting
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Zugriff wird überprüft...</p>
      </div>
    );
  }

  // If everything is fine, render the children
  return <>{children}</>;
}
