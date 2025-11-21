'use client';
import { useRouter } from 'next/navigation';
import StudentOrganizationForm from '../form';

export default function AddStudentOrganizationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/student-organizations');
  };

  return (
    <StudentOrganizationForm 
      onSuccess={handleSuccess} 
    />
  );
}
