'use client';
import OrgForm from '../form';
import { useRouter } from 'next/navigation';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import type { StudentOrganization } from '@/types';

export default function AddStudentOrgPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSave = async (data: any) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Xəta', description: 'Firestore servisi tapılmadı.' });
            return false;
        }
        
        const orgId = uuidv4();
        const orgDocRef = doc(firestore, 'telebe-teskilatlari', orgId);
        
        const newOrgData: StudentOrganization = { 
          ...data,
          id: orgId,
          memberIds: [] // Ensure memberIds is initialized
        };
        
        addDocumentNonBlocking(orgDocRef, newOrgData);

        toast({ title: 'Uğurlu', description: 'Tələbə təşkilatı uğurla yaradıldı.' });
        router.push('/admin/telebe-teskilatlari');
        return true;
    };

    return <OrgForm onSave={handleSave} />;
}
