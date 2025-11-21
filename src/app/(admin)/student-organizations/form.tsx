'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, where } from 'firebase/firestore';
import type { StudentOrganization, Student, FacultyData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(3, "Ad ən azı 3 hərf olmalıdır."),
  description: z.string().min(10, "Təsvir ən azı 10 hərf olmalıdır."),
  logoUrl: z.string().url("Etibarlı bir URL daxil edin.").optional().or(z.literal('')),
  faculty: z.string().min(1, "Fakültə seçmək mütləqdir."),
  leaderId: z.string().min(1, "Rəhbər seçmək mütləqdir."),
  memberIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface StudentOrganizationFormProps {
  initialData?: StudentOrganization | null;
  onSuccess: () => void;
}

export default function StudentOrganizationForm({ initialData, onSuccess }: StudentOrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const facultiesQuery = useMemoFirebase(() => collection(firestore, 'faculties'), [firestore]);
  const { data: faculties } = useCollection<FacultyData>(facultiesQuery);

  const studentsQuery = useMemoFirebase(() => query(collection(firestore, 'users'), where('role', '==', 'student')), [firestore]);
  const { data: students } = useCollection<Student>(studentsQuery);
  
  const isEditMode = !!initialData;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      logoUrl: initialData?.logoUrl || '',
      faculty: initialData?.faculty || '',
      leaderId: initialData?.leaderId || '',
      memberIds: initialData?.memberIds || [],
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (values) => {
    setIsLoading(true);

    try {
      if (isEditMode && initialData) {
        const orgDocRef = doc(firestore, 'student-organizations', initialData.id);
        await updateDocumentNonBlocking(orgDocRef, values);
        toast({ title: 'Uğurlu', description: 'Təşkilat məlumatları uğurla yeniləndi.' });
      } else {
        await addDocumentNonBlocking(collection(firestore, 'student-organizations'), values);
        toast({ title: 'Uğurlu', description: 'Tələbə təşkilatı uğurla yaradıldı.' });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Təşkilat yaradılarkən/yenilənərkən xəta:", error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: error.message || 'Xəta baş verdi.',
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Tələbə Təşkilatını Redaktə Et' : 'Yeni Tələbə Təşkilatı Yarat'}</CardTitle>
        <CardDescription>
          Təşkilatın məlumatlarını daxil edin və ya yeniləyin.
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
                  <FormLabel>Ad</FormLabel>
                  <FormControl>
                    <Input placeholder="Təşkilatın adı" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Təşkilatın fəaliyyəti haqqında qısa məlumat" {...field} rows={4} />
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
              name="leaderId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Rəhbər</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? students?.find(s => s.id === field.value)?.firstName + ' ' + students?.find(s => s.id === field.value)?.lastName
                            : "Tələbə seçin"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                      <Command>
                        <CommandInput placeholder="Tələbə axtar..." />
                        <CommandEmpty>Tələbə tapılmadı.</CommandEmpty>
                        <CommandList>
                            <CommandGroup>
                            {students?.map((student) => (
                                <CommandItem
                                value={`${student.firstName} ${student.lastName}`}
                                key={student.id}
                                onSelect={() => {
                                    form.setValue("leaderId", student.id);
                                }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    student.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {student.firstName} {student.lastName}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
