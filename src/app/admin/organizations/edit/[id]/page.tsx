'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/types';
import { doc, getDoc } from "firebase/firestore"; 
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';


const formSchema = z.object({
  name: z.string().min(2, "Təşkilat adı ən azı 2 hərf olmalıdır."),
  companyName: z.string().min(2, "Şirkət adı ən azı 2 hərf olmalıdır."),
  sector: z.string().min(2, "Sektor adı ən azı 2 hərf olmalıdır."),
  logoUrl: z.string().url().or(z.literal('')).optional(),
});

export default function EditOrganizationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();

  const orgId = typeof params.id === 'string' ? params.id : '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      companyName: '',
      sector: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (!orgId || !firestore) return;

    const fetchOrganization = async () => {
      setIsPageLoading(true);
      const orgDocRef = doc(firestore, 'users', orgId);
      const orgSnap = await getDoc(orgDocRef);
      if (orgSnap.exists()) {
        const orgData = orgSnap.data() as Organization;
        form.reset(orgData);
      } else {
        toast({ variant: 'destructive', title: 'Təşkilat tapılmadı' });
        router.push('/admin/organizations');
      }
      setIsPageLoading(false);
    };

    fetchOrganization();
  }, [orgId, firestore, form, router, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
        const orgDocRef = doc(firestore, 'users', orgId);
        updateDocumentNonBlocking(orgDocRef, values);

        toast({
            title: 'Uğurlu',
            description: 'Təşkilat məlumatları uğurla yeniləndi.',
        });
        router.push('/admin/organizations');
    } catch (error: any) {
        console.error("Təşkilat yenilənərkən xəta:", error);
        toast({
            variant: 'destructive',
            title: 'Xəta',
            description: error.message || 'Təşkilat yenilənərkən xəta baş verdi.',
        });
    }

    setIsLoading(false);
  }

  if (isPageLoading) {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Təşkilatı Redaktə Et</CardTitle>
        <CardDescription>
          Təşkilatın məlumatlarını yeniləyin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təşkilatın Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Məs: NDU Startap Mərkəzi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rəsmi Şirkət Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Məs: NDU Startap Mərkəzi MMC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sektor</FormLabel>
                  <FormControl>
                    <Input placeholder="Məs: Texnologiya" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (Könüllü)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" asChild>
                    <Link href="/admin/organizations">Ləğv et</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Yenilənir...' : 'Yadda Saxla'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
