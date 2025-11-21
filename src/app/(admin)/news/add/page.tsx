'use client';
import { useRouter } from 'next/navigation';
import EditNewsForm from '../edit-form';

export default function AddNewsPage() {
  const router = useRouter();

  const handleSuccess = (id: string) => {
    router.push('/admin/news');
  };

  return (
    <EditNewsForm 
      onSuccess={handleSuccess} 
    />
  );
}
