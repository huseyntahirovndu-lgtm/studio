'use client';
import OrgForm from '../form';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { StudentOrganization } from '@/types';

export default function AddStudentOrgPage() {
    const router = useRouter();
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSave = async (data: any) => {
        if (!user || user.role !== 'admin') {
            toast({ variant: 'destructive', title: 'Səlahiyyət xətası' });
            return false;
        }
        
        const orgCollectionRef = collection(firestore, 'telebe-teskilatlari');
        await addDocumentNonBlocking(orgCollectionRef, data);

        toast({ title: 'Uğurlu', description: 'Tələbə təşkilatı uğurla yaradıldı.' });
        router.push('/admin/telebe-teskilatlari');
        return true;
    };

    return <OrgForm onSave={handleSave} />;
}
