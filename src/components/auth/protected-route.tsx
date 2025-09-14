
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
    // Wait until the initial authentication state check is complete
    if (loading) {
      return; 
    }

    // If there's no user, redirect to login
    if (!user) {
      router.replace(loginPath);
      return;
    }

    // User is logged in, now check roles
    const userRole = claims?.role;
    let isAuthorized = true;

    if (userRole !== requiredRole) {
      isAuthorized = false;
    }

    if (requiredRole === 'hotelier') {
      const userHotelId = claims?.hotelId;
      if (userHotelId !== requiredHotelId) {
        isAuthorized = false;
      }
    }

    // If not authorized, log them out (to clear any bad state) and redirect
    if (!isAuthorized) {
        logout().then(() => {
            router.replace(loginPath);
        });
    }

  }, [user, claims, loading, router, requiredRole, requiredHotelId, loginPath, logout]);

  // While loading, or if user is not yet available, show a loading indicator.
  // Also, don't render children if the claims don't match, to prevent a flicker of content.
  if (loading || !user || claims?.role !== requiredRole) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Überprüfe Zugriff...</p>
        </div>
    );
  }

  // If everything is fine, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
