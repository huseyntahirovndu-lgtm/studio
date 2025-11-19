'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { AppUser } from '@/types';

// This hook is responsible for fetching the user's profile from Firestore
export const useUserProfile = (uid: string | undefined) => {
  const firestore = useFirestore();
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid || !firestore) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      
      // Check in 'users' collection first
      let userDocRef = doc(firestore, 'users', uid);
      let userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setProfile(userDoc.data() as AppUser);
        setProfileLoading(false);
        return;
      }

      // If not in 'users', check in 'organizations'
      userDocRef = doc(firestore, 'organizations', uid);
      userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setProfile(userDoc.data() as AppUser);
      } else {
        console.warn(`User profile not found for UID: ${uid} in users or organizations`);
        setProfile(null); // No profile found
      }
      
      setProfileLoading(false);
    };

    fetchProfile();
  }, [uid, firestore]);

  return { profile, isProfileLoading };
};
