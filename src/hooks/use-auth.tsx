'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useDoc, useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import type { AppUser, Student, Organization } from '@/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

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

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, isUserLoading } = useFirebaseAuth();
  const firestore = useFirestore();
  const auth = useFirebaseAuth();
  const router = useRouter();

  const userDocRef = firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null;
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<AppUser>(userDocRef);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged and useDoc will handle the rest
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    signOut(auth).then(() => {
        router.push('/login');
    });
  };

  const register = async (
    newUser: Omit<Student, 'id' | 'createdAt' | 'status'> | Omit<Organization, 'id' | 'createdAt'>,
    pass: string
  ): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, pass);
      const user = userCredential.user;
      
      const userDocRef = doc(firestore, 'users', user.uid);
      
      let userWithId: AppUser;
      if (newUser.role === 'student') {
        userWithId = {
          ...newUser,
          id: user.uid,
          createdAt: new Date().toISOString(),
          status: 'gözləyir',
        } as Student;
      } else {
        userWithId = {
          ...newUser,
          id: user.uid,
          createdAt: new Date().toISOString(),
        } as Organization;
      }

      await setDoc(userDocRef, userWithId);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const updateUser = (updatedUser: AppUser): boolean => {
    try {
        const userDocRef = doc(firestore, 'users', updatedUser.id);
        updateDocumentNonBlocking(userDocRef, updatedUser);
        return true;
    } catch (error) {
        console.error("Failed to update user:", error);
        return false;
    }
  };

  const loading = isUserLoading || isProfileLoading;
  const user = userProfile || null;

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
