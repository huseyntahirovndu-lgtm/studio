'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Organization } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getOrganizationById } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const orgProfileSchema = z.object({
  name: z.string().min(2, { message: 'Təşkilat adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  companyName: z.string().min(2, { message: 'Şirkət adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  sector: z.string().min(2, { message: 'Sektor adı ən azı 2 hərfdən ibarət olmalıdır.' }),
});

function EditOrganizationPageComponent() {
  const { id } = useParams();
  const { user: adminUser, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const organizationId = typeof id === 'string' ? id : '';

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof orgProfileSchema>>({
    resolver: zodResolver(orgProfileSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!adminUser || adminUser.role !== 'admin') {
        router.push('/login');
        return;
      }
      if (organizationId) {
        const orgData = getOrganizationById(organizationId);
        if (orgData) {
          setOrganization(orgData);
          form.reset({
            name: orgData.name || '',
            companyName: orgData.companyName || '',
            sector: orgData.sector || '',
          });
        } else {
          toast({ variant: "destructive", title: "Xəta", description: "Təşkilat tapılmadı." });
          router.push('/admin/organizations');
        }
        setIsLoading(false);
      }
    }
  }, [adminUser, authLoading, organizationId, router, toast, form]);

  const onSubmit: SubmitHandler<z.infer<typeof orgProfileSchema>> = async (data) => {
    if (!organization) return;
    setIsSaving(true);
    const updatedOrg = { ...organization, ...data };
    const success = updateUser(updatedOrg);
    
    if (success) {
      toast({ title: "Təşkilat məlumatları uğurla yeniləndi!" });
      router.push('/admin/organizations');
    } else {
      toast({ variant: "destructive", title: "Xəta", description: "Məlumatlar yenilənərkən xəta baş verdi." });
    }
    setIsSaving(false);
  };

  if (isLoading || authLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-40" />
            </CardContent>
        </Card>
    );
  }
  
  if (!organization) {
    return null; // or a not found component
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>"{organization.name}" Redaktə Et</CardTitle>
        <CardDescription>
          Təşkilatın məlumatlarını buradan dəyişdirə bilərsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təşkilatın Adı</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="companyName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rəsmi Şirkət Adı</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="sector"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fəaliyyət Sektoru</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Yadda Saxla'}
                </Button>
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Ləğv et
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


export default function EditOrganizationPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-8 text-center">Yüklənir...</div>}>
            <EditOrganizationPageComponent />
        </Suspense>
    )
}
