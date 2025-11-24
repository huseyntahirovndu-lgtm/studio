'use client';
import OrgForm from '../form';
import { useRouter } from 'next/navigation';
import { useFirestore, useAuth } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import type { StudentOrganization } from '@/types';

export default function AddStudentOrgPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { register } = useAuth(); // Use the unified register function
    const { toast } = useToast();

    const handleSave = async (data: any, pass: string) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Xəta', description: 'Firestore servisi tapılmadı.' });
            return false;
        }

        const newOrgData: Omit<StudentOrganization, 'id' | 'createdAt'> = {
            role: 'student-organization',
            name: data.name,
            email: data.email,
            description: data.description,
            logoUrl: data.logoUrl,
            faculty: data.faculty,
            leaderId: data.leaderId,
            memberIds: [],
            status: data.status,
        };

        const success = await register(newOrgData, pass, true); // Pass true to skip redirection

        if (success) {
            toast({ title: 'Uğurlu', description: 'Tələbə təşkilatı uğurla yaradıldı.' });
            router.push('/admin/telebe-teskilatlari');
            return true;
        } else {
            toast({ variant: 'destructive', title: 'Xəta', description: 'Təşkilat yaradılarkən xəta baş verdi (e-poçt artıq mövcud ola bilər).' });
            return false;
        }
    };

    return <OrgForm onSave={handleSave} />;
}
