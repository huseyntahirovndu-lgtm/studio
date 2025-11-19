'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Organization } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Building } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Təşkilat adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  companyName: z.string().min(2, { message: 'Şirkət adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  sector: z.string().min(2, { message: 'Sektor adı ən azı 2 hərfdən ibarət olmalıdır.' }),
});

export default function EditOrganizationProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const organization = user as Organization;

  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!loading && (!user || (user as Organization)?.role !== 'organization')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || '',
        companyName: organization.companyName || '',
        sector: organization.sector || '',
      });
    }
  }, [organization, form]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    if (!user) return;
    setIsSaving(true);
    const updatedUser = { ...user, ...data };
    const success = updateUser(updatedUser);
    
    if (success) {
      toast({ title: "Profil məlumatları uğurla yeniləndi!" });
    } else {
      toast({ variant: "destructive", title: "Xəta", description: "Profil yenilənərkən xəta baş verdi." });
    }
    setIsSaving(false);
  };

  if (loading || !organization) {
    return <div className="container mx-auto py-8 text-center">Yüklənir...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Təşkilat Profilini Redaktə Et</h1>
        <p className="text-muted-foreground">Təşkilatınızın məlumatlarını buradan idarə edə bilərsiniz.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building /> Təşkilat Məlumatları</CardTitle>
          <CardDescription>Rəsmi məlumatlarınızı yeniləyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Təşkilatın Adı</FormLabel>
                  <FormControl><Input {...field} placeholder="Məs: Startap Mərkəzi" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="companyName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Rəsmi Şirkət Adı</FormLabel>
                  <FormControl><Input {...field} placeholder="Məs: NDU Startap Mərkəzi MMC" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="sector" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Fəaliyyət Sektoru</FormLabel>
                  <FormControl><Input {...field} placeholder="Məs: Texnologiya" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Yadda Saxla'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
