
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'agency' | 'hotelier';
  requiredHotelId?: string; // This will now be used for hotelier routes
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

    // 1. Check if the user has the required role
    if (userRole !== requiredRole) {
      isAuthorized = false;
    }

    // 2. If the route is for a specific hotel, check if the user's hotelId matches
    if (requiredRole === 'hotelier') {
      const userHotelId = claims?.hotelId;
      // The requiredHotelId is passed from the layout of the dynamic route
      if (!userHotelId || userHotelId !== requiredHotelId) {
        isAuthorized = false;
      }
    }

    // If not authorized, log them out (to clear any bad state) and redirect to the appropriate login page
    if (!isAuthorized) {
        logout().then(() => {
            // Redirect to the main hotel login if they fail an authorization check.
            // Agency users would likely not land here anyway if the roles don't match.
            router.replace('/hotel/login'); 
        });
    }

  }, [user, claims, loading, router, requiredRole, requiredHotelId, loginPath, logout]);

  // While loading, or if user is not yet available, or if claims are wrong, show a loading indicator.
  // This prevents a flicker of content for unauthorized users.
  if (loading || !user || claims?.role !== requiredRole || (requiredRole === 'hotelier' && claims?.hotelId !== requiredHotelId)) {
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
