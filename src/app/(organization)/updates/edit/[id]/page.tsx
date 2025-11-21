'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useAuth, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { StudentOrgUpdate, StudentOrganization } from '@/types';
import OrgUpdateEditForm from '../edit-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditOrgUpdatePage() {
  const { id } = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useAuth();
  
  const ledOrgQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'student-organizations'), where('leaderId', '==', user.id), limit(1)) : null,
    [firestore, user]
  );
  const { data: ledOrgs, isLoading: orgsLoading } = useCollection<StudentOrganization>(ledOrgQuery);
  const organizationId = ledOrgs?.[0]?.id;

  const updateId = typeof id === 'string' ? id : '';
  const updateDocRef = doc(firestore, `student-organizations/${organizationId}/updates`, updateId);
  const { data: updateData, isLoading: updateLoading } = useDoc<StudentOrgUpdate>(updateDocRef);
  
  const isLoading = orgsLoading || updateLoading;

  const handleSuccess = () => {
    router.push('/organization-panel/updates');
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
  
  if(!updateData && !isLoading) {
    return <p>Yenilik tapılmadı.</p>
  }

  return (
    <OrgUpdateEditForm 
      onSuccess={handleSuccess}
      initialData={updateData}
    />
  );
}
