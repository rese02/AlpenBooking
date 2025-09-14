
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase';
import { removeSession, createSession } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  claims: any; // You can define a more specific type for claims
  loading: boolean;
  login: (email: string, pass: string, role: 'agency' | 'hotelier', hotelId?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
      if (user) {
        setUser(user);
        const tokenResult = await user.getIdTokenResult();
        setClaims(tokenResult.claims);
      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string, role: 'agency' | 'hotelier', hotelId?: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, pass);
        const idToken = await userCredential.user.getIdToken(true); // Force refresh to get latest claims

        if (role === 'agency') {
            await createSession(idToken);
            router.push('/admin');
        } else if (role === 'hotelier' && hotelId) {
            // Placeholder for hotelier session creation
            // await createHotelierSession(idToken, hotelId);
            router.push(`/dashboard/${hotelId}`);
        } else {
            throw new Error("Invalid role or missing hotelId for hotelier.");
        }

    } catch (error: any) {
        // Re-throw the error to be caught by the calling component
        throw error;
    }
  };

  const logout = async () => {
    await signOut(clientAuth);
    await removeSession();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, claims, loading, login, logout }}>
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
