'use client';
import { useRouter } from 'next/navigation';
import NewsEditForm from '../edit-form';

export default function AddNewsPage() {
  const router = useRouter();

  const handleSuccess = (id: string) => {
    // Navigate back to the news list after successful creation
    router.push('/admin/news');
  };

  return (
    <NewsEditForm 
      onSuccess={handleSuccess} 
    />
  );
}
