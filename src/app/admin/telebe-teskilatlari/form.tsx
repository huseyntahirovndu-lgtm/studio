'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Student, StudentOrganization, FacultyData } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';

const formSchema = z.object({
  name: z.string().min(3, "Ad ən azı 3 hərf olmalıdır."),
  email: z.string().email("Etibarlı e-poçt daxil edin."),
  password: z.string().min(6, "Şifrə ən azı 6 simvol olmalıdır.").optional(),
  description: z.string().min(10, "Təsvir ən azı 10 hərf olmalıdır."),
  faculty: z.string().min(1, "Fakültə seçmək mütləqdir."),
  leaderId: z.string().min(1, "Rəhbər seçmək mütləqdir."),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  status: z.enum(['təsdiqlənmiş', 'gözləyir', 'arxivlənmiş']),
});

type FormData = z.infer<typeof formSchema>;

interface OrgFormProps {
  initialData?: StudentOrganization;
  onSave: (data: Omit<FormData, 'password'>, password?: string) => Promise<boolean>;
}

export default function OrgForm({ initialData, onSave }: OrgFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const firestore = useFirestore();

  const isEditMode = !!initialData;
  
  const studentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "users"), where("role", "==", "student")) : null, [firestore]);
  const facultiesQuery = useMemoFirebase(() => firestore ? collection(firestore, "faculties") : null, [firestore]);
  
  const { data: students } = useCollection<Student>(studentsQuery);
  const { data: faculties } = useCollection<FacultyData>(facultiesQuery);

  const studentOptions = students?.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` })) || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      description: '',
      faculty: '',
      leaderId: '',
      logoUrl: '',
      status: 'gözləyir',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (values) => {
    setIsSaving(true);
    // On edit, password is not required/changed.
    // On create, it is. The form validation handles this.
    const { password, ...restOfValues } = values;
    const success = await onSave(restOfValues, password);
    if (!success) {
      setIsSaving(false);
    }
  };
  
  // Make password required only in create mode
  if (!isEditMode) {
      formSchema.extend({
          password: z.string().min(6, "Şifrə ən azı 6 simvol olmalıdır."),
      });
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Tələbə Təşkilatını Redaktə Et' : 'Yeni Tələbə Təşkilatı Yarat'}</CardTitle>
        <CardDescription>
          Təşkilat üçün məlumatları və giriş detallarını daxil edin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təşkilatın Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Məs: Debat Klubu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giriş E-poçtu</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="teskilat@ndu.edu.az" {...field} disabled={isEditMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isEditMode && (
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Şifrə</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
             </div>

             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Təşkilatın məqsədi və fəaliyyəti haqqında qısa məlumat" {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="faculty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Əsas Fakültə</FormLabel>
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
                  name="leaderId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Təşkilat Rəhbəri</FormLabel>
                      <Combobox
                          options={studentOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Rəhbər seçin..."
                          searchPlaceholder="Tələbə axtar..."
                          notFoundText="Tələbə tapılmadı."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loqo URL (Könüllü)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Status</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="təsdiqlənmiş">Təsdiqlənmiş</SelectItem>
                          <SelectItem value="gözləyir">Gözləyir</SelectItem>
                          <SelectItem value="arxivlənmiş">Arxivlənmiş</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Ləğv et
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
