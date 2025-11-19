'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';

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
import { FirebaseError } from 'firebase/app';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'Ad ən azı 2 hərfdən ibarət olmalıdır.' }),
  lastName: z.string().min(2, { message: 'Soyad ən azı 2 hərfdən ibarət olmalıdır.' }),
  email: z.string().email({ message: 'Etibarlı bir e-poçt ünvanı daxil edin.' }),
  password: z.string().min(6, { message: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.' }),
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. Update user profile in Firebase Auth
      await updateProfile(user, {
        displayName: `${values.firstName} ${values.lastName}`,
      });

      // 3. Create user document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const newUser = {
        id: user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        faculty: '', // Will be filled later
        major: '', // Will be filled later
        courseYear: 1, // Default
        skills: [],
        category: 'STEM', // Default
        createdAt: serverTimestamp(),
      };
      
      setDocumentNonBlocking(userDocRef, newUser, { merge: false });


      toast({
        title: 'Qeydiyyat Uğurlu Oldu',
        description: 'Hesabınız yaradıldı. İstedad Mərkəzinə xoş gəlmisiniz!',
      });
      router.push('/');

    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Bu e-poçt ünvanı artıq istifadə olunur.';
        }
      }
      toast({
        variant: 'destructive',
        title: 'Qeydiyyat Uğursuz Oldu',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Qeydiyyat</CardTitle>
        <CardDescription>
          Başlamaq üçün yeni bir hesab yaradın.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input placeholder="Aylin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Məmmədova" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              {isLoading ? 'Hesab yaradılır...' : 'Hesab yarat'}
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
  );
}
