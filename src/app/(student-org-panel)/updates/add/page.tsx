'use client';
import { useRouter } from 'next/navigation';
import OrgUpdateEditForm from '../edit-form';

export default function AddOrgUpdatePage() {
  const router = useRouter();

  const handleSuccess = (id: string) => {
    router.push('/telebe-teskilati-paneli/updates');
  };

  return (
    <OrgUpdateEditForm 
      onSuccess={handleSuccess} 
    />
  );
}
