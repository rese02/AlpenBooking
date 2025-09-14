
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
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) {
      return; 
    }

    if (!user) {
      router.replace(loginPath);
      return;
    }

    const checkAuthorization = async () => {
        try {
            const tokenResult = await user.getIdTokenResult(true);
            const claims = tokenResult.claims;
            const userRole = claims.role;

            let hasPermission = false;
            if (userRole === requiredRole) {
                if (requiredRole === 'hotelier') {
                    if (claims.hotelId === requiredHotelId) {
                        hasPermission = true;
                    }
                } else {
                    hasPermission = true;
                }
            }

            if (hasPermission) {
                setIsAuthorized(true);
            } else {
                 console.warn(`Authorization failed. User role: "${userRole}", Required: "${requiredRole}". Or hotelId mismatch.`);
                 await logout();
                 router.replace(loginPath);
            }
        } catch (error) {
            console.error("Error during authorization check:", error);
            await logout();
            router.replace(loginPath);
        }
    };

    checkAuthorization();

  }, [user, loading, requiredRole, requiredHotelId, loginPath, router, logout]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Zugriff wird überprüft...</p>
      </div>
    );
  }

  return <>{children}</>;
}
