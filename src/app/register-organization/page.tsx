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
  CardFooter,
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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Təşkilat adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  companyName: z.string().min(2, { message: 'Şirkət adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  sector: z.string().min(2, { message: 'Sektor adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  email: z.string().email({ message: 'Etibarlı bir e-poçt ünvanı daxil edin.' }),
  password: z.string().min(6, { message: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.' }),
});

export default function RegisterOrganizationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      companyName: '',
      sector: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const newUser = {
      role: 'organization' as const,
      name: values.name,
      companyName: values.companyName,
      sector: values.sector,
      email: values.email,
      savedStudentIds: [],
    };

    const success = await register(newUser, values.password);

    if (success) {
      toast({
        title: 'Qeydiyyat Uğurlu Oldu',
        description: 'Təşkilat hesabınız yaradıldı.',
      });
      router.push('/login');
    } else {
      toast({
        variant: 'destructive',
        title: 'Qeydiyyat Uğursuz Oldu',
        description: 'Bu e-poçt ünvanı artıq istifadə olunur.',
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Təşkilat Qeydiyyatı</CardTitle>
        <CardDescription>
          Təşkilat profilinizi yaratmaq üçün məlumatları daxil edin.
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
                    <Input placeholder="Məs: Startap Mərkəzi" {...field} />
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
                  <FormLabel>Fəaliyyət Sektoru</FormLabel>
                  <FormControl>
                    <Input placeholder="Məs: Texnologiya" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-poçt</FormLabel>
                    <FormControl>
                      <Input placeholder="ad@nümunə.com" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Hesab yaradılır...' : 'Hesab Yarat'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        Artıq hesabınız var?{' '}
        <Button variant="link" asChild>
           <Link href="/login">Daxil olun</Link>
        </Button>
      </CardFooter>
    </Card>
    </div>
  );
}
