'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase, useUser, useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import type { AppUser, Student, Organization } from '@/types';
import { setDocumentNonBlocking, initiateEmailSignUp, initiateEmailSignIn } from '@/firebase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
  register: (
    user: Omit<Student, 'id' | 'createdAt'> | Omit<Organization, 'id' | 'createdAt'>,
    pass: string
  ) => void;
  updateUser: (user: AppUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, isUserLoading } = useUser();
  // We will fetch the user profile from firestore
  // const { data: userProfile, isLoading: isProfileLoading } = useDoc<AppUser>(
  //   firebaseUser ? doc(useFirestore(), 'users', firebaseUser.uid) : null
  // );

  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const login = (email: string, pass: string) => {
    initiateEmailSignIn(auth, email, pass);
  };

  const logout = () => {
    signOut(auth);
    router.push('/login');
  };

  const register = (
    newUser: Omit<Student, 'id' | 'createdAt' | 'status'> | Omit<Organization, 'id' | 'createdAt'>,
    pass: string
  ) => {
    createUserWithEmailAndPassword(auth, newUser.email, pass)
      .then(userCredential => {
        const user = userCredential.user;
        const userWithId: AppUser = {
          ...newUser,
          id: user.uid,
          createdAt: new Date().toISOString(),
          ...(newUser.role === 'student' && { status: 'gözləyir' }),
        };
        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, userWithId, { merge: true });
      })
      .catch(error => {
        console.error('Registration failed:', error);
      });
  };

  const updateUser = (updatedUser: AppUser) => {
    const userDocRef = doc(firestore, 'users', updatedUser.id);
    setDocumentNonBlocking(userDocRef, updatedUser, { merge: true });
  };

  const loading = isUserLoading; // || isProfileLoading;
  const user = null; //userProfile;

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
