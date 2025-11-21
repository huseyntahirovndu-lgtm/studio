'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { News } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(5, "Başlıq ən azı 5 hərf olmalıdır."),
  coverImageUrl: z.string().url("Etibarlı bir URL daxil edin.").optional().or(z.literal('')),
  content: z.string().min(20, "Məzmun ən azı 20 hərf olmalıdır."),
});

type FormData = z.infer<typeof formSchema>;

interface EditNewsFormProps {
  initialData?: News | null;
  onSuccess: (id: string) => void;
}

// Slugify function
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};


export default function EditNewsForm({ initialData, onSuccess }: EditNewsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();
  
  const isEditMode = !!initialData;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      coverImageUrl: initialData?.coverImageUrl || '',
      content: initialData?.content || '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (values) => {
    if (!user || user.role !== 'admin') {
      toast({ variant: 'destructive', title: 'Səlahiyyət Xətası', description: "Bu əməliyyatı etmək üçün admin olmalısınız." });
      return;
    }
    
    setIsLoading(true);

    try {
      if (isEditMode && initialData) {
        // Update existing news
        const newsDocRef = doc(firestore, 'news', initialData.id);
        await updateDocumentNonBlocking(newsDocRef, {
          ...values,
          slug: slugify(values.title),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Uğurlu', description: 'Xəbər uğurla yeniləndi.' });
        onSuccess(initialData.id);
      } else {
        // Create new news
        const newsCollectionRef = collection(firestore, 'news');
        const newDocRef = doc(newsCollectionRef); // Create a new doc ref to get ID
        const newNews: Omit<News, 'id' | 'createdAt'> & {id: string; createdAt: any} = {
          id: newDocRef.id,
          ...values,
          slug: slugify(values.title),
          authorId: user.id,
          authorName: `${user.firstName} ${user.lastName}`,
          createdAt: serverTimestamp(),
        };
        await addDocumentNonBlocking(newsCollectionRef, newNews);
        toast({ title: 'Uğurlu', description: 'Xəbər uğurla yaradıldı.' });
        onSuccess(newDocRef.id);
      }
    } catch (error: any) {
      console.error("Xəbər yaradılarkən/yenilənərkən xəta:", error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: error.message || 'Xəbər yaradılarkən/yenilənərkən xəta baş verdi.',
      });
    }

    setIsLoading(false);
  };

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
                  <FormLabel>Üz Qabığı Şəkli URL (Könüllü)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
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
                    <Textarea placeholder="Xəbərin tam məzmununu buraya daxil edin..." {...field} rows={10} />
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
