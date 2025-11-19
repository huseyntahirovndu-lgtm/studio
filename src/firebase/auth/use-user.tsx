'use client';
import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, onSnapshot, DocumentReference, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { AppUser, Student, Organization } from '@/types';
import { useUser as useAuthUser } from '@/firebase/provider'; // Renaming to avoid conflict

// This hook is responsible for fetching the user's profile from Firestore
export const useUserProfile = (uid: string | undefined) => {
  const firestore = useFirestore();
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);

  const userDocRef = useMemo(() => uid && firestore ? doc(firestore, 'users', uid) : null, [uid, firestore]);
  const orgDocRef = useMemo(() => uid && firestore ? doc(firestore, 'organizations', uid) : null, [uid, firestore]);

  useEffect(() => {
    if (!uid || !firestore) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    const unsubUser = onSnapshot(userDocRef!, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as Student);
        setProfileLoading(false);
        // If we found a student, no need to listen to the org doc anymore
        unsubOrg && unsubOrg(); 
        return;
      }
      
      // If user doc doesn't exist, it might be an organization, so we don't stop loading yet.
      // The org snapshot listener will handle it.
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setProfileLoading(false);
    });

    const unsubOrg = onSnapshot(orgDocRef!, (docSnap) => {
      // Only set profile if it hasn't been set by the user listener
      if (docSnap.exists()) {
          setProfile(docSnap.data() as Organization);
      } else {
         // If neither doc exists after checking both, set profile to null
         setProfile(currentProfile => currentProfile ? currentProfile : null);
      }
       setProfileLoading(false);
    }, (error) => {
        console.error("Error fetching organization profile:", error);
        setProfileLoading(false);
    });

    // Cleanup function
    return () => {
      unsubUser();
      unsubOrg();
    };
  }, [uid, firestore, userDocRef, orgDocRef]);

  return { profile, isProfileLoading };
};

// Re-export the main useUser hook that combines auth and profile
export const useUser = () => {
    const { user, isUserLoading: isAuthLoading, userError } = useAuthUser();
    const { profile, isProfileLoading: isProfileLoading } = useUserProfile(user?.uid);

    return {
        user,
        profile,
        isUserLoading: isAuthLoading || isProfileLoading,
        userError,
    }
}
