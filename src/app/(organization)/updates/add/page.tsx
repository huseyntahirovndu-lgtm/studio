'use client';
import { useRouter } from 'next/navigation';
import OrgUpdateEditForm from '../edit-form';

export default function AddOrgUpdatePage() {
  const router = useRouter();

  const handleSuccess = (id: string) => {
    router.push('/organization-panel/updates');
  };

  return (
    <OrgUpdateEditForm 
      onSuccess={handleSuccess} 
    />
  );
}
