'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppUser, Student, Organization } from '@/types';
import { users as initialUsers, addUser, updateUser as updateUserData } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  register: (user: Omit<Student, 'id' | 'createdAt'> | Omit<Organization, 'id' | 'createdAt'>, pass: string) => boolean;
  updateUser: (user: AppUser) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAKE_PASSWORDS: { [email: string]: string } = {
  'aysel@example.com': 'password123',
  'orxan@example.com': 'password123',
  'leyla@example.com': 'password123',
  'contact@techsolutions.com': 'password123',
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
    const foundUser = initialUsers.find(u => u.email === email);
    const storedPassword = FAKE_PASSWORDS[email];
    
    if (foundUser && storedPassword === pass) {
      localStorage.setItem('session-user', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('session-user');
    setUser(null);
    router.push('/login');
  };

  const register = (newUser: Omit<Student, 'id'|'createdAt'> | Omit<Organization, 'id'|'createdAt'>, pass: string): boolean => {
    const existing = initialUsers.find(u => u.email === newUser.email);
    if (existing) {
      return false; // User already exists
    }
    const userWithId = { ...newUser, id: uuidv4(), createdAt: new Date() };
    
    // In a real app, you would hash the password. Here we just store it for the fake login.
    FAKE_PASSWORDS[userWithId.email] = pass;
    
    // This part would normally be an API call to your backend to save the user
    initialUsers.push(userWithId as AppUser);

    return true;
  };
  
  const updateUser = (updatedUser: AppUser): boolean => {
    const success = updateUserData(updatedUser);
    if(success) {
        setUser(updatedUser);
        localStorage.setItem('session-user', JSON.stringify(updatedUser));
        // Update the user in the main data array as well
        const userIndex = initialUsers.findIndex(u => u.id === updatedUser.id);
        if(userIndex !== -1) {
            initialUsers[userIndex] = updatedUser;
        }
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
