
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
      return; // Wait until auth state is confirmed
    }

    if (!user) {
      router.replace(loginPath);
      return;
    }

    const userRole = claims?.role;
    let isAuthorized = true;

    if (userRole !== requiredRole) {
      isAuthorized = false;
    }

    if (requiredRole === 'hotelier') {
      const userHotelId = claims?.hotelId;
      if (!userHotelId || userHotelId !== requiredHotelId) {
        isAuthorized = false;
      }
    }
    
    if (!isAuthorized) {
        // Redirect to the correct login page based on the required role
        const targetLoginPath = requiredRole === 'agency' ? '/agency/login' : '/hotel/login';
        logout().then(() => {
            router.replace(targetLoginPath); 
        });
    }

  }, [user, claims, loading, router, requiredRole, requiredHotelId, loginPath, logout]);

  // Render a loading state while auth is being checked to prevent content flashing
  if (loading || !user || claims?.role !== requiredRole || (requiredRole === 'hotelier' && claims?.hotelId !== requiredHotelId)) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Überprüfe Zugriff...</p>
        </div>
    );
  }

  // If authorized, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
