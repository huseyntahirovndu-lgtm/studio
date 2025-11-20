'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppUser, Student, Organization, Admin } from '@/types';
import { addUser, updateUser as updateUserData, getUsers } from '@/lib/data';
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
  'admin@ndu.edu.az': 'adminpassword',
  'polad.elizade@example.com': 'password123',
  'shovket.elisoy@example.com': 'password123',
  'zeyneb.seyidli@example.com': 'password123'
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
    const foundUser = getUsers().find(u => u.email === email);
    const storedPass = FAKE_PASSWORDS[email];

    if (foundUser && storedPass === pass) {
      setUser(foundUser);
      localStorage.setItem('session-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('session-user');
    setUser(null);
    router.push('/login');
  };

  const register = (newUser: Omit<Student, 'id'|'createdAt'|'status'> | Omit<Organization, 'id'|'createdAt'>, pass: string): boolean => {
    if (getUsers().some(u => u.email === newUser.email)) {
      return false; // User already exists
    }

    const userWithId: AppUser = {
      ...newUser,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...(newUser.role === 'student' && { status: 'gözləyir' }),
    };

    addUser(userWithId);
    FAKE_PASSWORDS[userWithId.email] = pass;

    return true;
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
