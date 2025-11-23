'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, where, limit, addDoc, updateDoc } from 'firebase/firestore';
import type { StudentOrgUpdate, StudentOrganization } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(5, "Başlıq ən azı 5 hərf olmalıdır."),
  content: z.string().min(20, "Məzmun ən azı 20 hərf olmalıdır."),
});

type FormData = z.infer<typeof formSchema>;

interface EditOrgUpdateFormProps {
  initialData?: StudentOrgUpdate | null;
  onSuccess: (id: string) => void;
}

export default function OrgUpdateEditForm({ initialData, onSuccess }: EditOrgUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();
  
  const ledOrgQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'telebe-teskilatlari'), where('leaderId', '==', user.id), limit(1)) : null,
    [firestore, user]
  );
  const { data: ledOrgs } = useCollection<StudentOrganization>(ledOrgQuery);
  const organizationId = ledOrgs?.[0]?.id;

  const isEditMode = !!initialData;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (values) => {
    if (!user || !organizationId || !firestore) {
      toast({ variant: 'destructive', title: 'Səlahiyyət Xətası', description: "Bu əməliyyatı etmək üçün təşkilat rəhbəri olmalısınız." });
      return;
    }
    
    setIsLoading(true);

    try {
      const updatesCollectionRef = collection(firestore, `telebe-teskilatlari/${organizationId}/updates`);

      if (isEditMode && initialData) {
        // Update existing update
        const updateDocRef = doc(updatesCollectionRef, initialData.id);
        await updateDoc(updateDocRef, {
          ...values,
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Uğurlu', description: 'Yenilik uğurla yeniləndi.' });
        onSuccess(initialData.id);
      } else {
        // Create new update
        const newUpdateData = {
          ...values,
          organizationId: organizationId,
          createdAt: serverTimestamp(),
        };
        const newDocRef = await addDoc(updatesCollectionRef, newUpdateData);
        toast({ title: 'Uğurlu', description: 'Yenilik uğurla yaradıldı.' });
        if (newDocRef) {
          onSuccess(newDocRef.id);
        }
      }
    } catch (error: any) {
      console.error("Yenilik yaradılarkən/yenilənərkən xəta:", error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: error.message || 'Yenilik yaradılarkən/yenilənərkən xəta baş verdi.',
      });
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Yeniliyi Redaktə Et' : 'Yeni Yenilik Yarat'}</CardTitle>
        <CardDescription>
          Təşkilatınız üçün yeni xəbər və ya elan daxil edin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlıq</FormLabel>
                  <FormControl>
                    <Input placeholder="Yeniliyin başlığı" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Məzmun</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Yeniliyin tam məzmununu buraya daxil edin..." {...field} rows={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Ləğv et
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Yadda saxlanılır...' : (isEditMode ? 'Yenilə' : 'Yarat')}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
