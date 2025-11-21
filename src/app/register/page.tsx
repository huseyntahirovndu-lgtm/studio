'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegisterRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/register-student');
  }, [router]);

  return null; 
}
