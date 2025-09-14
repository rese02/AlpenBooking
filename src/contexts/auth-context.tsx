
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Role = 'agency' | 'hotelier' | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  login: (email: string, pass: string, expectedRole: 'agency' | 'hotelier', hotelId?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Force refresh the token to get the latest claims.
        const tokenResult = await user.getIdTokenResult(true);
        setUser(user);
        setRole(tokenResult.claims.role as Role || null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string, expectedRole: 'agency' | 'hotelier', hotelId?: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    // Force a token refresh to get the latest custom claims immediately after login.
    const tokenResult = await userCredential.user.getIdTokenResult(true); 

    const userRole = tokenResult.claims.role;
    const userHotelId = tokenResult.claims.hotelId;

    // Check 1: Does the user have the role they are trying to log in as?
    if (userRole !== expectedRole) {
      await signOut(auth); // Log out immediately
      const error = new Error(`Permission denied: User role is "${userRole}", but expected "${expectedRole}".`);
      (error as any).code = 'permission-denied';
      throw error;
    }

    // Check 2: If logging in as a hotelier, do they have access to this specific hotel?
    if (expectedRole === 'hotelier' && userHotelId !== hotelId) {
        await signOut(auth); // Log out immediately
        const error = new Error(`Permission denied: User is not authorized for hotel "${hotelId}".`);
        (error as any).code = 'permission-denied';
        throw error;
    }

    // If all checks pass, update the state
    setUser(userCredential.user);
    setRole(userRole as Role);
  };

  const logout = async () => {
    await signOut(auth);
    setRole(null);
    setUser(null);
    router.push('/'); // Redirect to home page after logout
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Authentifizierung wird geprüft...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
