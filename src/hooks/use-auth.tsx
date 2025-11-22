'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { AppUser, Student, Organization } from '@/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';


interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (
    user: Omit<Student, 'id' | 'createdAt' | 'status'> | Omit<Organization, 'id' | 'createdAt'>,
    pass: string
  ) => Promise<boolean>;
  updateUser: (user: AppUser) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAKE_AUTH_DELAY = 500;

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const userDocRef = doc(firestore, 'users', userId);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUser(userSnap.data() as AppUser);
          } else {
            localStorage.removeItem('userId');
          }
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, [firestore]);


  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate network delay
    await new Promise(res => setTimeout(res, FAKE_AUTH_DELAY));

    // Admin hardcoded check
    if (email === 'admin@ndu.edu.az' && pass === 'adminpassword') {
        const adminUser: AppUser = {
            id: 'admin_user',
            role: 'admin',
            email: 'admin@ndu.edu.az',
            firstName: 'Admin',
            lastName: 'User',
        };
        setUser(adminUser);
        localStorage.setItem('userId', adminUser.id);
        setLoading(false);
        router.push('/admin/dashboard');
        return true;
    }

    try {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No user found with this email.");
        setLoading(false);
        return false;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as AppUser & { passwordHash?: string };
      
      // In a real app, you would compare a hashed password. 
      // For this prototype, we are simplifying. Let's assume the password is correct if the user exists.
      // IMPORTANT: THIS IS NOT SECURE FOR PRODUCTION.
      if (userData) {
        setUser(userData);
        localStorage.setItem('userId', userData.id);
        
        if (userData.role === 'student') router.push('/student-dashboard');
        else if (userData.role === 'organization') router.push('/organization-dashboard');
        else router.push('/');

        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const register = async (
    newUser: Omit<Student, 'id' | 'createdAt' | 'status'> | Omit<Organization, 'id' | 'createdAt'>,
    pass: string // Password is not used, but kept for function signature consistency
  ): Promise<boolean> => {
     setLoading(true);
     // Simulate network delay
     await new Promise(res => setTimeout(res, FAKE_AUTH_DELAY));

    try {
      // Check if user already exists
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", newUser.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("User with this email already exists.");
        setLoading(false);
        return false;
      }

      const newUserId = uuidv4();
      const userDocRef = doc(firestore, 'users', newUserId);
      
      const userWithId = {
          ...newUser,
          id: newUserId,
          createdAt: new Date().toISOString(),
          // NOTE: Password is not stored for this prototype for simplicity.
          // In a real app, you'd store a salted hash.
          status: newUser.role === 'student' ? 'gözləyir' : undefined,
      };

      await setDoc(userDocRef, userWithId);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
      return false;
    }
  };

  const updateUser = (updatedUserData: AppUser): boolean => {
    try {
        const userDocRef = doc(firestore, 'users', updatedUserData.id);
        updateDocumentNonBlocking(userDocRef, updatedUserData);
        // Also update local state if the current user is being updated
        if(user?.id === updatedUserData.id) {
            setUser(updatedUserData);
        }
        return true;
    } catch (error) {
        console.error("Failed to update user:", error);
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SessionProvider');
  }
  return context;
};
