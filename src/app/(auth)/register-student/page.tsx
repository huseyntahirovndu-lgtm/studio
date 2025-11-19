'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, collection } from 'firebase/firestore';
import { useAuth, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { calculateTalentScore } from '@/ai/flows/talent-scoring';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { seedDatabase } from '@/lib/seed'; // Import seeder
import { Database } from 'lucide-react'; // Import an icon


const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'Ad ən azı 2 hərfdən ibarət olmalıdır.'
  }),
  lastName: z.string().min(2, {
    message: 'Soyad ən azı 2 hərfdən ibarət olmalıdır.'
  }),
  email: z.string().email({
    message: 'Etibarlı bir e-poçt ünvanı daxil edin.'
  }),
  password: z.string().min(6, {
    message: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.'
  }),
  faculty: z.string().min(1, {
    message: 'Fakültə seçmək mütləqdir.'
  }),
  major: z.string().min(2, {
    message: 'İxtisas ən azı 2 hərfdən ibarət olmalıdır.'
  }),
  courseYear: z.coerce.number().min(1).max(4),
  category: z.string().min(1, {
    message: 'Kateqoriya seçmək mütləqdir.'
  }),
});

export default function RegisterStudentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const facultiesQuery = useMemoFirebase(
    () => firestore ? collection(firestore, 'faculties') : null,
    [firestore]
  );
  const { data: faculties } = useCollection(facultiesQuery);

  const categoriesQuery = useMemoFirebase(
    () => firestore ? collection(firestore, 'categories') : null,
    [firestore]
  );
  const { data: categories } = useCollection(categoriesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      faculty: '',
      major: '',
      courseYear: 1,
      category: '',
    },
  });

  async function handleSeedDatabase() {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Xəta', description: 'Verilənlər bazası xidməti mövcud deyil.' });
      return;
    }
    setIsSeeding(true);
    const result = await seedDatabase(firestore);
    if (result.success) {
      toast({ title: 'Uğurlu', description: result.message });
      // Optionally refresh or navigate
      window.location.reload();
    } else {
      toast({ variant: 'destructive', title: 'Xəbərdarlıq', description: result.message });
    }
    setIsSeeding(false);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Xəta",
        description: "Firebase xidmətləri mövcud deyil. Zəhmət olmasa, daha sonra yenidən cəhd edin.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${values.firstName} ${values.lastName}`,
      });

      const userDocRef = doc(firestore, 'users', user.uid);
      const newUserProfile: any = {
        id: user.uid,
        role: 'student' as const,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        faculty: values.faculty,
        major: values.major,
        courseYear: values.courseYear,
        skills: ['Yeni Tələbə'],
        category: values.category,
        createdAt: serverTimestamp(),
        projectIds: [],
        achievementIds: [],
        certificateIds: [],
        linkedInURL: '',
        githubURL: '',
        behanceURL: '',
        instagramURL: '',
        portfolioURL: '',
        talentScore: 0,
      };

      try {
        const scoreResult = await calculateTalentScore({
          profileData: JSON.stringify(newUserProfile)
        });
        newUserProfile.talentScore = scoreResult.talentScore;
      } catch (aiError) {
        console.error("AI talent score calculation failed:", aiError);
        newUserProfile.talentScore = Math.floor(Math.random() * 30) + 10;
      }

      setDocumentNonBlocking(userDocRef, newUserProfile, { merge: false });

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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Tələbə Qeydiyyatı</CardTitle>
        <CardDescription>
          Profilinizi yaratmaq üçün məlumatları daxil edin.
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
                      <Input placeholder="Adınız" {...field} />
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
                      <Input placeholder="Soyadınız" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="faculty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fakültə</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Fakültə seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {faculties?.map(faculty => (
                          <SelectItem key={faculty.id} value={faculty.name}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İxtisas</FormLabel>
                    <FormControl>
                      <Input placeholder="İxtisasınız" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Təhsil ili</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kursu seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4].map(year => (
                          <SelectItem key={year} value={String(year)}>
                            {year}-ci kurs
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İstedad Kateqoriyası</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kateqoriya seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isSeeding}>
              {isLoading ? 'Hesab yaradılır...' : 'Hesab yarat'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          Artıq hesabınız var?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Daxil olun
          </Link>
        </p>
         {process.env.NODE_ENV === 'development' && (
          <div className="text-center w-full">
            <p className="text-xs text-muted-foreground mb-2">Yalnız developerlər üçün:</p>
            <Button
              variant="outline"
              onClick={handleSeedDatabase}
              disabled={isSeeding || isLoading}
            >
              <Database className="mr-2 h-4 w-4" />
              {isSeeding ? 'Məlumatlar yerləşdirilir...' : 'Nümunə Məlumatları Yerləşdir'}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
