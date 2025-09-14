
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut, getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { removeSession } from '@/lib/auth-actions';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  claims: any; 
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const clientAuth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
      setLoading(true);
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setUser(user);
        setClaims(tokenResult.claims);
        
        const userRole = tokenResult.claims.role;
        const hotelId = tokenResult.claims.hotelId;
        const publicPaths = ['/agency/login', '/hotel/login', '/'];
        const isPublicPath = publicPaths.includes(pathname);

        // Force redirection if user is on a public page or wrong dashboard
        if (userRole === 'agency' && !pathname.startsWith('/admin')) {
          router.replace('/admin');
        } else if (userRole === 'hotelier' && hotelId && !pathname.startsWith(`/dashboard/${hotelId}`)) {
          router.replace(`/dashboard/${hotelId}`);
        }
      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientAuth, router, pathname]);

  const logout = async () => {
    await signOut(clientAuth);
    await removeSession();
    // Nach dem Ausloggen, leite basierend auf der aktuellen Seite weiter.
    // Wenn man auf einer Admin-Seite war, zum Agentur-Login, sonst zum Hotel-Login.
    const loginPath = pathname.startsWith('/admin') ? '/agency/login' : '/hotel/login';
    router.replace(loginPath);
  };
  
  const isRedirecting = () => {
      if (!loading && user && claims?.role) {
          if (claims.role === 'agency' && !pathname.startsWith('/admin')) return true;
          if (claims.role === 'hotelier' && claims.hotelId && !pathname.startsWith(`/dashboard/${claims.hotelId}`)) return true;
      }
      return false;
  }

  if (loading || isRedirecting()) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Sie werden weitergeleitet...</p>
        </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, claims, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
