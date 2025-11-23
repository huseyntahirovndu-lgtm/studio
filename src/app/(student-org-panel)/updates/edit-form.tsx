'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, updateDoc, addDoc, query, where, limit } from 'firebase/firestore';
import type { StudentOrgUpdate, StudentOrganization } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, "Başlıq ən azı 5 hərf olmalıdır."),
  content: z.string().min(20, "Məzmun ən azı 20 hərf olmalıdır."),
  coverImageUrl: z.string().url("Etibarlı URL daxil edin").or(z.literal('')).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditOrgUpdateFormProps {
  initialData?: StudentOrgUpdate | null;
  onSuccess: (id: string) => void;
}

export default function OrgUpdateEditForm({ initialData, onSuccess }: EditOrgUpdateFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();
  
  const isEditMode = !!initialData;
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const ledOrgQuery = useMemoFirebase(() => 
    user && firestore ? query(collection(firestore, 'telebe-teskilatlari'), where('leaderId', '==', user.id), limit(1)) : null,
    [firestore, user]
  );
  const { data: ledOrgs } = useCollection<StudentOrganization>(ledOrgQuery);
  const organization = ledOrgs?.[0];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      coverImageUrl: initialData?.coverImageUrl || '',
    },
  });
  
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/sekiller', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        form.setValue('coverImageUrl', result.url, { shouldValidate: true, shouldDirty: true });
        toast({ title: "Şəkil uğurla yükləndi." });
      } else {
        throw new Error(result.error || 'Şəkil yüklənərkən xəta baş verdi.');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: "Yükləmə Xətası", description: err.message });
    } finally {
      setIsUploading(false);
    }
  };


  const onSubmit: SubmitHandler<FormData> = async (values) => {
    if (!organization) {
      toast({ variant: 'destructive', title: 'Səlahiyyət Xətası', description: "Bu əməliyyatı etmək üçün təşkilat rəhbəri olmalısınız." });
      return;
    }
    
    setIsSaving(true);

    try {
      const updatesCollectionRef = collection(firestore, `telebe-teskilatlari/${organization.id}/updates`);
      const topLevelUpdatesCollectionRef = collection(firestore, 'student-org-updates');

      if (isEditMode && initialData) {
        const updateDocRef = doc(updatesCollectionRef, initialData.id);
        const topLevelUpdateDocRef = doc(topLevelUpdatesCollectionRef, initialData.id);

        await updateDoc(updateDocRef, {
          ...values,
          updatedAt: serverTimestamp(),
        });
        await updateDoc(topLevelUpdateDocRef, {
          ...values,
          updatedAt: serverTimestamp(),
        });

        toast({ title: 'Uğurlu', description: 'Yenilik uğurla yeniləndi.' });
        onSuccess(initialData.id);
      } else {
        const newUpdateData = {
          ...values,
          organizationId: organization.id,
          createdAt: serverTimestamp(),
        };
        const newDocRef = await addDoc(updatesCollectionRef, newUpdateData);
        // Also add to top-level collection for easier querying on homepage
        await addDoc(topLevelUpdatesCollectionRef, { ...newUpdateData, id: newDocRef.id });

        toast({ title: 'Uğurlu', description: 'Yenilik uğurla yaradıldı.' });
        onSuccess(newDocRef.id);
      }
    } catch (error: any) {
      console.error("Yenilik yaradılarkən/yenilənərkən xəta:", error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: error.message || 'Yenilik yaradılarkən/yenilənərkən xəta baş verdi.',
      });
    }

    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Yeniliyi Redaktə Et' : 'Yeni Yenilik Yarat'}</CardTitle>
        <CardDescription>
          Təşkilatınızın fəaliyyəti haqqında yeni məlumat daxil edin.
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
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Örtük Şəkli</FormLabel>
                   <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                     <Button type="button" onClick={() => coverImageInputRef.current?.click()} disabled={isUploading}>
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Yüklənir...' : 'Yüklə'}
                    </Button>
                    <Input 
                        ref={coverImageInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                  </div>
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
                     <Textarea {...field} rows={10} placeholder="Yeniliyin tam mətni..." />
                  </FormControl>
                   <div className="text-sm text-muted-foreground">
                    Mətni formatlamaq üçün sadə HTML teqlərindən istifadə edə bilərsiniz (məs: `<b>qalin</b>`, `<h2>başlıq</h2>`, `<ul><li>siyahı</li></ul>`).
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Ləğv et
                </Button>
                <Button type="submit" disabled={isSaving || isUploading}>
                    {isSaving ? 'Yadda saxlanılır...' : (isEditMode ? 'Yenilə' : 'Yarat')}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
