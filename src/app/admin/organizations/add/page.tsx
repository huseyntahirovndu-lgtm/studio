'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
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


const formSchema = z.object({
  name: z.string().min(2, "Təşkilat adı ən azı 2 hərf olmalıdır."),
  companyName: z.string().min(2, "Şirkət adı ən azı 2 hərf olmalıdır."),
  email: z.string().email("Etibarlı email daxil edin."),
  password: z.string().min(6, "Şifrə ən azı 6 hərf olmalıdır."),
  sector: z.string().min(2, "Sektor adı ən azı 2 hərf olmalıdır."),
  logoUrl: z.string().url().or(z.literal('')).optional(),
});

export default function AddOrganizationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      companyName: '',
      email: '',
      password: '',
      sector: '',
      logoUrl: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const newOrganization: Omit<Organization, 'id' | 'createdAt'> = {
        role: 'organization',
        email: values.email,
        name: values.name,
        companyName: values.companyName,
        sector: values.sector,
        logoUrl: values.logoUrl,
        savedStudentIds: [],
        projectIds: [],
    };
    
    const success = await register(newOrganization, values.password);

    if (success) {
        toast({
            title: 'Uğurlu',
            description: 'Təşkilat uğurla yaradıldı.',
        });
        router.push('/admin/organizations');
    } else {
        toast({
            variant: 'destructive',
            title: 'Xəta',
            description: 'Təşkilat yaradılarkən xəta baş verdi (e-poçt artıq mövcud ola bilər).',
        });
    }


    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Yeni Təşkilat Yarat</CardTitle>
        <CardDescription>
          Platformaya yeni partnyor təşkilat əlavə edin.
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
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>E-poçt</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Şifrə</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
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
                    {isLoading ? 'Yaradılır...' : 'Təşkilat Yarat'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
