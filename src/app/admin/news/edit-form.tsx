'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { News, Admin } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  title: z.string().min(5, "Başlıq ən azı 5 hərf olmalıdır."),
  content: z.string().min(20, "Məzmun ən azı 20 hərf olmalıdır."),
  coverImageUrl: z.string().url("Etibarlı URL daxil edin").or(z.literal('')).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditNewsFormProps {
  initialData?: News | null;
  onSuccess: (id: string) => void;
}

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export default function NewsEditForm({ initialData, onSuccess }: EditNewsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();
  
  const isEditMode = !!initialData;
  const coverImageInputRef = useRef<HTMLInputElement>(null);

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
      if (response.ok && result.success) {
        form.setValue('coverImageUrl', result.url, { shouldValidate: true, shouldDirty: true });
        toast({ title: "Şəkil uğurla yükləndi." });
      } else {
        throw new Error(result.error || 'Şəkil yüklənərkən xəta baş verdi.');
      }
    } catch (err: any) {
      console.error("Upload error details:", err);
      toast({ variant: 'destructive', title: "Yükləmə Xətası", description: err.message });
    } finally {
      setIsUploading(false);
    }
  };


  const onSubmit: SubmitHandler<FormData> = async (values) => {
    setIsSaving(true);
    
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Xəta', description: 'Giriş edilməyib və ya verilənlər bazası tapılmadı.' });
      setIsSaving(false);
      return;
    }

    try {
      const adminUser = user as Admin;

      if (isEditMode && initialData) {
        const newsDocRef = doc(firestore, 'news', initialData.id);
        updateDocumentNonBlocking(newsDocRef, {
          ...values,
          slug: generateSlug(values.title),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Uğurlu', description: 'Xəbər uğurla yeniləndi.' });
        onSuccess(initialData.id);
      } else {
        const newDocId = uuidv4();
        const newDocRef = doc(firestore, 'news', newDocId);
        const newNewsData: News = {
            id: newDocId,
            title: values.title,
            content: values.content,
            coverImageUrl: values.coverImageUrl,
            slug: generateSlug(values.title),
            authorId: user.id,
            authorName: adminUser?.firstName && adminUser?.lastName ? `${adminUser.firstName} ${adminUser.lastName}` : "Admin",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        addDocumentNonBlocking(collection(firestore, 'news'), newNewsData);
        toast({ title: 'Uğurlu', description: 'Xəbər uğurla yaradıldı.' });
        onSuccess(newDocId);
      }
    } catch (error: any) {
      console.error("Xəbər yaradılarkən/yenilənərkən xəta:", error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: error.message || 'Xəbər yaradılarkən/yenilənərkən xəta baş verdi.',
      });
    }

    setIsSaving(false);
  };

  const isSubmitDisabled = isSaving || isUploading || !user || !firestore;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Xəbəri Redaktə Et' : 'Yeni Xəbər Yarat'}</CardTitle>
        <CardDescription>
          Platforma üçün yeni xəbər və ya elan daxil edin.
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
                    <Input placeholder="Xəbərin başlığı" {...field} />
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
                     <Textarea {...field} rows={10} placeholder="Xəbərin tam mətni..."/>
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
                <Button type="submit" disabled={isSubmitDisabled}>
                    {isSaving ? 'Yadda saxlanılır...' : (isEditMode ? 'Yenilə' : 'Yarat')}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
