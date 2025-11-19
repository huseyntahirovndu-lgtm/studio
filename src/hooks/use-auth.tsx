'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppUser, Student, Organization, Admin } from '@/types';
import { addUser, updateUser as updateUserData } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  register: (user: Omit<Student, 'id' | 'createdAt' | 'status'> | Omit<Organization, 'id' | 'createdAt'>, pass: string) => boolean;
  updateUser: (user: AppUser) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAKE_PASSWORDS: { [email: string]: string } = {
  'aysel@example.com': 'password123',
  'orxan@example.com': 'password123',
  'leyla@example.com': 'password123',
  'contact@techsolutions.com': 'password123',
  'startup@ndu.edu.az': 'password123',
  'admin@ndu.edu.az': 'adminpassword'
};


export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for a saved session
    try {
      const savedUser = localStorage.getItem('session-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('session-user');
    }
    setLoading(false);
  }, []);

  const login = (email: string, pass: string): boolean => {
    // This logic is now handled by Firebase. This is a placeholder.
    console.log("Login attempt for:", email);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('session-user');
    setUser(null);
    router.push('/login');
  };

  const register = (newUser: Omit<Student, 'id'|'createdAt'|'status'> | Omit<Organization, 'id'|'createdAt'>, pass: string): boolean => {
     // This logic is now handled by Firebase. This is a placeholder.
    console.log("Register attempt for:", newUser.email);
    return false;
  };
  
  const updateUser = (updatedUser: AppUser): boolean => {
    const success = updateUserData(updatedUser);
    if(success) {
        setUser(updatedUser);
        localStorage.setItem('session-user', JSON.stringify(updatedUser));
    }
    return success;
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
