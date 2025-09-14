
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase';
import { removeSession } from '@/lib/auth-actions';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  claims: any; // You can define a more specific type for claims
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const tokenResult = await user.getIdTokenResult();
        setClaims(tokenResult.claims);
        
        // --- START: INTELLIGENTE WEITERLEITUNG ---
        const userRole = tokenResult.claims.role;
        const publicPaths = ['/agency/login', '/hotel/login', '/'];

        if (userRole === 'agency' && !pathname.startsWith('/admin')) {
          router.replace('/admin');
        } else if (userRole === 'hotelier' && tokenResult.claims.hotelId && !pathname.startsWith('/dashboard')) {
          router.replace(`/dashboard/${tokenResult.claims.hotelId}`);
        } else if (userRole && publicPaths.includes(pathname)) {
            // Fallback, wenn ein eingeloggter User auf eine öffentliche Seite gerät
            if(userRole === 'agency') router.replace('/admin');
            else if(userRole === 'hotelier') router.replace(`/dashboard/${tokenResult.claims.hotelId}`);
        }
        // --- ENDE: INTELLIGENTE WEITERLEITUNG ---

      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const logout = async () => {
    await signOut(clientAuth);
    await removeSession();
    router.replace('/'); // Nach dem Ausloggen zur Startseite
  };
  
    // Zeigt eine Ladeanzeige, während die Weiterleitung stattfindet
  if (loading || (user && claims?.role && !pathname.startsWith('/admin') && !pathname.startsWith('/dashboard'))) {
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
