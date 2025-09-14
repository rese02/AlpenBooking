
'use client';

import React, { useEffect } from 'react';
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
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait until authentication status is resolved
    }

    if (!user) {
      router.replace(loginPath);
      return;
    }

    if (role !== requiredRole) {
      console.warn(`Access denied. User role: "${role}", Required role: "${requiredRole}"`);
      router.replace(loginPath); // Or a dedicated access-denied page
      return;
    }
    
    if (requiredRole === 'hotelier') {
        const claims = (user as any).reloadUserInfo.customAttributes;
        if(claims) {
            const userClaims = JSON.parse(claims);
            if (userClaims.hotelId !== requiredHotelId) {
                console.warn(`Access denied. User hotelId: "${userClaims.hotelId}", Required hotelId: "${requiredHotelId}"`);
                router.replace(loginPath);
            }
        }
    }

  }, [user, role, loading, router, loginPath, requiredRole, requiredHotelId]);

  if (loading || !user || role !== requiredRole) {
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
