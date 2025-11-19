'use client';
import { useState, useEffect } from 'react';
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
import type { AppUser } from '@/types';

const formSchema = z.object({
  email: z.string().email({ message: 'Etibarlı bir e-poçt ünvanı daxil edin.' }),
  password: z.string().min(6, { message: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.' }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      const appUser = user as AppUser;
      if (appUser.role === 'student') {
        router.push('/student-dashboard');
      } else if (appUser.role === 'organization') {
        router.push('/organization-dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const success = login(values.email, values.password);

    if (success) {
      toast({
        title: 'Uğurlu Giriş',
        description: 'İstedad Mərkəzinə xoş gəlmisiniz!',
      });
      // The useEffect above will handle the redirection
    } else {
      toast({
        variant: 'destructive',
        title: 'Giriş Uğursuz Oldu',
        description: 'E-poçt və ya şifrə yanlışdır.',
      });
    }
    setIsLoading(false);
  }
  
  if (loading || user) {
    return <div className="text-center">Yönləndirilir...</div>;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Giriş</CardTitle>
        <CardDescription>
          Hesabınıza daxil olmaq üçün məlumatlarınızı daxil edin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {isLoading ? 'Giriş edilir...' : 'Daxil ol'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col items-center justify-center text-sm">
        <p>
            Hesabınız yoxdur?{' '}
            <Button variant="link" asChild className="p-0">
               <Link href="/register">Qeydiyyat</Link>
            </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
