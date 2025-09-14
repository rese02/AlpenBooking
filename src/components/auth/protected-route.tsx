
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
      return; 
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
        // Leitet zur korrekten Login-Seite weiter, je nachdem welche Rolle für die Route erforderlich ist.
        const targetLoginPath = requiredRole === 'agency' ? '/agency/login' : '/hotel/login';
        logout().then(() => {
            router.replace(targetLoginPath); 
        });
    }

  }, [user, claims, loading, router, requiredRole, requiredHotelId, loginPath, logout]);

  if (loading || !user || claims?.role !== requiredRole || (requiredRole === 'hotelier' && claims?.hotelId !== requiredHotelId)) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Überprüfe Zugriff...</p>
        </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
