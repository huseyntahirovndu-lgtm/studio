'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { StudentOrganization } from '@/types';
import StudentOrganizationForm from '../form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditStudentOrganizationPage() {
  const { id } = useParams();
  const router = useRouter();
  const firestore = useFirestore();

  const orgId = typeof id === 'string' ? id : '';
  const orgDocRef = doc(firestore, 'student-organizations', orgId);
  const { data: org, isLoading } = useDoc<StudentOrganization>(orgDocRef);

  const handleSuccess = () => {
    router.push('/admin/student-organizations');
  };
  
  if(isLoading) {
    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
        </div>
    )
  }
  
  if(!org && !isLoading) {
    return <p>Tələbə təşkilatı tapılmadı.</p>
  }

  return (
    <StudentOrganizationForm
      onSuccess={handleSuccess}
      initialData={org}
    />
  );
}
