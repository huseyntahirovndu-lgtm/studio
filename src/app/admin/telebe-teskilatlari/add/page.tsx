'use client';
import OrgForm from '../form';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function AddStudentOrgPage() {
    const router = useRouter();
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSave = async (data: any) => {
        if (!user || user.role !== 'admin' || !firestore) {
            toast({ variant: 'destructive', title: 'Səlahiyyət xətası' });
            return false;
        }
        
        const orgId = uuidv4();
        const orgDocRef = doc(firestore, 'telebe-teskilatlari', orgId);
        
        await addDocumentNonBlocking(orgDocRef, { ...data, id: orgId });

        toast({ title: 'Uğurlu', description: 'Tələbə təşkilatı uğurla yaradıldı.' });
        router.push('/admin/telebe-teskilatlari');
        return true;
    };

    return <OrgForm onSave={handleSave} />;
}
