
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
        try {
          const tokenResult = await user.getIdTokenResult(true);
          setUser(user);
          setRole(tokenResult.claims.role as Role || null);
        } catch (error) {
           console.error("Error fetching user token with claims:", error);
           setUser(user); // Set user even if claims fail
           setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string, expectedRole: 'agency' | 'hotelier', hotelId?: string) => {
    // The login function is now only responsible for signing the user in.
    // The role validation is handled by the ProtectedRoute component.
    await signInWithEmailAndPassword(auth, email, pass);
    
    // We don't need to check roles here anymore. ProtectedRoute will do it.
    // This avoids the race condition/caching issue.
  };

  const logout = async () => {
    await signOut(auth);
    // State will be cleared by onAuthStateChanged listener
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
