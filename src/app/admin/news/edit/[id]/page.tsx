'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { News } from '@/types';
import NewsEditForm from '../../edit-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditNewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  
  const newsId = typeof id === 'string' ? id : '';
  const newsDocRef = doc(firestore, 'news', newsId);
  const { data: newsData, isLoading } = useDoc<News>(newsDocRef);
  
  const handleSuccess = () => {
    router.push('/admin/news');
  };
  
  if(isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-24" />
        </div>
    )
  }
  
  if(!newsData && !isLoading) {
    return <p>Xəbər tapılmadı.</p>
  }

  return (
    <NewsEditForm 
      onSuccess={handleSuccess}
      initialData={newsData}
    />
  );
}
