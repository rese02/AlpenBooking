
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'agency' | 'hotelier';
  requiredHotelId?: string;
  loginPath: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredHotelId,
  loginPath,
}) => {
  const { user, claims, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait until authentication state is determined
    }

    const checkAuthorization = async () => {
        if (!user) {
            router.replace(loginPath);
            return;
        }

        const userRole = claims?.role;

        if (userRole !== requiredRole) {
            await logout();
            router.replace(loginPath);
            return;
        }

        if (requiredRole === 'hotelier') {
            const userHotelId = claims?.hotelId;
            if (userHotelId !== requiredHotelId) {
                await logout();
                router.replace(loginPath);
                return;
            }
        }
    }
    
    checkAuthorization();

  }, [user, claims, loading, router, requiredRole, requiredHotelId, loginPath, logout]);

  if (loading || !user || claims?.role !== requiredRole) {
    // Render a loading state or nothing while checking authorization
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Überprüfe Zugriff...</p>
        </div>
    );
  }

  // If authorized, render the children components
  return <>{children}</>;
};

export default ProtectedRoute;
