'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Organization, Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Building, Briefcase, PlusCircle, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where, writeBatch, documentId } from 'firebase/firestore';


const orgProfileSchema = z.object({
  name: z.string().min(2, { message: 'Təşkilat adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  companyName: z.string().min(2, { message: 'Şirkət adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  sector: z.string().min(2, { message: 'Sektor adı ən azı 2 hərfdən ibarət olmalıdır.' }),
  logoUrl: z.string().url({ message: 'Etibarlı bir URL daxil edin.' }).or(z.literal('')).optional(),
});

const projectSchema = z.object({
  title: z.string().min(3, "Layihə adı boş ola bilməz."),
  description: z.string().min(10, "Təsvir ən azı 10 hərf olmalıdır."),
});

export default function EditOrganizationProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  
  const organization = user as Organization;

  const projectsQuery = useMemoFirebase(() => {
    if (!organization?.projectIds || organization.projectIds.length === 0) return null;
    return query(collection(firestore, 'projects'), where(documentId(), 'in', organization.projectIds));
  }, [firestore, organization?.projectIds]);
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  const orgForm = useForm<z.infer<typeof orgProfileSchema>>({
    resolver: zodResolver(orgProfileSchema),
    mode: 'onChange',
  });

  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    if (!loading) {
        if (!user || user.role !== 'organization') {
            router.push('/login');
        }
    }
  }, [user, loading, router]);


  useEffect(() => {
    if (organization) {
      orgForm.reset({
        name: organization.name || '',
        companyName: organization.companyName || '',
        sector: organization.sector || '',
        logoUrl: organization.logoUrl || '',
      });
    }
  }, [organization, orgForm]);

  const onProfileSubmit: SubmitHandler<z.infer<typeof orgProfileSchema>> = async (data) => {
    if (!organization) return;
    setIsSaving(true);
    
    const orgDocRef = doc(firestore, 'users', organization.id);
    updateDocumentNonBlocking(orgDocRef, data);

    toast({ title: "Profil məlumatları uğurla yeniləndi!" });
    
    setIsSaving(false);
  };
  
  const onProjectSubmit: SubmitHandler<z.infer<typeof projectSchema>> = async (data) => {
      if (!organization) return;
      setIsSaving(true);

      const projectsCollectionRef = collection(firestore, 'projects');
      const newProjectRef = doc(projectsCollectionRef);

      const newProject: Project = { 
          id: newProjectRef.id,
          studentId: organization.id, // Using studentId field for owner id
          ...data, 
          role: 'Təşkilat Layihəsi', // Default role
          status: 'davam edir', // Default status
          teamMemberIds: [],
          invitedStudentIds: [],
          applicantIds: []
        };
      
      const batch = writeBatch(firestore);
      batch.set(newProjectRef, newProject);

      const orgDocRef = doc(firestore, 'users', organization.id);
      const updatedProjectIds = [...(organization.projectIds || []), newProject.id];
      batch.update(orgDocRef, { projectIds: updatedProjectIds });

      await batch.commit();

      toast({ title: "Layihə uğurla əlavə edildi." });
      projectForm.reset();
      
      setIsSaving(false);
  };

  const handleDeleteProject = async (projectId: string) => {
      if (!organization) return;
      setIsSaving(true);
      
      const batch = writeBatch(firestore);
      
      const projectDocRef = doc(firestore, 'projects', projectId);
      batch.delete(projectDocRef);

      const orgDocRef = doc(firestore, 'users', organization.id);
      const updatedProjectIds = organization.projectIds?.filter(id => id !== projectId);
      batch.update(orgDocRef, { projectIds: updatedProjectIds });

      try {
        await batch.commit();
        toast({ title: "Layihə silindi." });
      } catch (error) {
         toast({ variant: "destructive", title: "Xəta", description: "Layihə silinərkən xəta baş verdi." });
      }
      
      setIsSaving(false);
  };

  if (loading || !organization) {
    return <div className="container mx-auto py-8 text-center">Yüklənir...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 md:py-12 px-4 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Təşkilat Profilini Redaktə Et</h1>
        <p className="text-muted-foreground">Təşkilatınızın məlumatlarını və layihələrini buradan idarə edə bilərsiniz.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building /> Təşkilat Məlumatları</CardTitle>
          <CardDescription>Rəsmi məlumatlarınızı və logonuzu yeniləyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...orgForm}>
            <form onSubmit={orgForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={orgForm.watch('logoUrl') || undefined} />
                      <AvatarFallback>{organization.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <FormField
                    control={orgForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

              <FormField name="name" control={orgForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Təşkilatın Adı</FormLabel>
                  <FormControl><Input {...field} placeholder="Məs: Startap Mərkəzi" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="companyName" control={orgForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Rəsmi Şirkət Adı</FormLabel>
                  <FormControl><Input {...field} placeholder="Məs: NDU Startap Mərkəzi MMC" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="sector" control={orgForm.control} render={({ field }) => (
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
      
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase /> Layihələri İdarə Et</CardTitle>
          <CardDescription>Yeni layihələr yaradın və ya mövcud olanları silin. Tələbələr bu layihələrə müraciət edə biləcəklər.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                  <FormField name="title" control={projectForm.control} render={({ field }) => (
                      <FormItem><FormLabel>Layihə Adı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="description" control={projectForm.control} render={({ field }) => (
                      <FormItem><FormLabel>Təsvir</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" disabled={isSaving}>
                      <PlusCircle className="mr-2 h-4 w-4" /> {isSaving ? 'Əlavə edilir...' : 'Yeni Layihə Yarat'}
                  </Button>
              </form>
          </Form>
           <Separator className="my-6" />
          <h4 className="text-md font-medium mb-4">Mövcud Layihələr</h4>
          <div className="space-y-4">
              {projectsLoading ? <p>Yüklənir...</p> : projects && projects.length > 0 ? projects.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-2 border rounded-md">
                      <span>{p.title}</span>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isSaving}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Silməni təsdiq edirsiniz?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Bu əməliyyat geri qaytarıla bilməz. "{p.title}" adlı layihə həmişəlik silinəcək.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProject(p.id)} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </div>
              )) : <p className="text-sm text-muted-foreground">Heç bir layihə tapılmadı.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
