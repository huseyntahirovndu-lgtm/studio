'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Student, Project, Achievement, Certificate, AchievementLevel, CertificateLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, Award, Briefcase, FileText, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Schemas
const profileSchema = z.object({
  firstName: z.string().min(2, "Ad ən azı 2 hərf olmalıdır."),
  lastName: z.string().min(2, "Soyad ən azı 2 hərf olmalıdır."),
  major: z.string().min(2, "İxtisas boş ola bilməz."),
  courseYear: z.coerce.number().min(1).max(4),
  skills: z.array(z.string().min(1)),
  linkedInURL: z.string().url().or(z.literal('')),
  githubURL: z.string().url().or(z.literal('')),
  behanceURL: z.string().url().or(z.literal('')),
  portfolioURL: z.string().url().or(z.literal('')),
});

const projectSchema = z.object({
  title: z.string().min(3, "Layihə adı boş ola bilməz."),
  description: z.string().min(10, "Təsvir ən azı 10 hərf olmalıdır."),
  role: z.string().min(2, "Rol boş ola bilməz."),
  link: z.string().url().or(z.literal('')),
  status: z.enum(['davam edir', 'tamamlanıb']),
});

const achievementSchema = z.object({
  name: z.string().min(3, "Nailiyyət adı boş ola bilməz."),
  position: z.string().min(1, "Dərəcə boş ola bilməz."),
  level: z.enum(['Beynəlxalq', 'Respublika', 'Regional', 'Universitet']),
  date: z.string().min(1, "Tarix boş ola bilməz."),
});

const certificateSchema = z.object({
    name: z.string().min(3, "Sertifikat adı boş ola bilməz."),
    certificateURL: z.string().url("Etibarlı bir URL daxil edin."),
    level: z.enum(['Beynəlxalq', 'Respublika', 'Regional', 'Universitet']),
});


export default function EditProfilePage() {
  const { user, isUserLoading, profile: userProfile } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const student = userProfile as Student;

  // State for forms
  const [isProfileSaving, setProfileSaving] = useState(false);
  const [isProjectSaving, setProjectSaving] = useState(false);
  const [isAchievementSaving, setAchievementSaving] = useState(false);
  const [isCertificateSaving, setCertificateSaving] = useState(false);
  
  // Data hooks
  const projectsRef = useMemoFirebase(() => user ? collection(firestore!, 'users', user.uid, 'projects') : null, [firestore, user]);
  const achievementsRef = useMemoFirebase(() => user ? collection(firestore!, 'users', user.uid, 'achievements') : null, [firestore, user]);
  const certificatesRef = useMemoFirebase(() => user ? collection(firestore!, 'users', user.uid, 'certificates') : null, [firestore, user]);
  
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsRef);
  const { data: achievements, isLoading: achievementsLoading } = useCollection<Achievement>(achievementsRef);
  const { data: certificates, isLoading: certificatesLoading } = useCollection<Certificate>(certificatesRef);

  // Forms
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });
  
  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: '', description: '', role: '', link: '', status: 'davam edir' }
  });

  const achievementForm = useForm<z.infer<typeof achievementSchema>>({
    resolver: zodResolver(achievementSchema),
    defaultValues: { name: '', position: '', level: 'Universitet', date: '' }
  });
  
  const certificateForm = useForm<z.infer<typeof certificateSchema>>({
    resolver: zodResolver(certificateSchema),
    defaultValues: { name: '', certificateURL: '', level: 'Universitet' }
  });

  // Redirect if not a student
  useEffect(() => {
    if (!isUserLoading && (!user || student?.role !== 'student')) {
      router.push('/login');
    }
  }, [user, isUserLoading, student, router]);

  // Set form default values once profile loads
  useEffect(() => {
    if (student) {
      profileForm.reset({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        major: student.major || '',
        courseYear: student.courseYear || 1,
        skills: student.skills || [],
        linkedInURL: student.linkedInURL || '',
        githubURL: student.githubURL || '',
        behanceURL: student.behanceURL || '',
        portfolioURL: student.portfolioURL || '',
      });
    }
  }, [student, profileForm]);
  
  // Handlers
  const onProfileSubmit: SubmitHandler<z.infer<typeof profileSchema>> = async (data) => {
    setProfileSaving(true);
    if (!user || !firestore) return;

    const userDocRef = doc(firestore, 'users', user.uid);
    
    // We only update the fields from this form
    const updatedData = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    updateDocumentNonBlocking(userDocRef, updatedData);
    
    toast({ title: "Profil yeniləndi", description: "Dəyişikliklər uğurla yadda saxlanıldı." });
    setProfileSaving(false);
  };
  
  const onProjectSubmit: SubmitHandler<z.infer<typeof projectSchema>> = (data) => {
    setProjectSaving(true);
    if (!projectsRef) return;

    const newProject: Omit<Project, 'id'> = {
        studentId: user!.uid,
        ...data
    };
    
    addDocumentNonBlocking(projectsRef, newProject);
    
    toast({ title: "Layihə əlavə edildi", description: `"${data.title}" layihəsi profilinizə əlavə olundu.` });
    projectForm.reset();
    setProjectSaving(false);
  };
  
  const onAchievementSubmit: SubmitHandler<z.infer<typeof achievementSchema>> = (data) => {
    setAchievementSaving(true);
    if (!achievementsRef) return;
    
    const newAchievement: Omit<Achievement, 'id'> = {
        studentId: user!.uid,
        ...data,
    };

    addDocumentNonBlocking(achievementsRef, newAchievement);
    
    toast({ title: "Nailiyyət əlavə edildi", description: "Yeni nailiyyətiniz profilinizə əlavə olundu." });
    achievementForm.reset();
    setAchievementSaving(false);
  };
  
  const onCertificateSubmit: SubmitHandler<z.infer<typeof certificateSchema>> = (data) => {
    setCertificateSaving(true);
    if (!certificatesRef) return;

    const newCertificate: Omit<Certificate, 'id'> = {
        studentId: user!.uid,
        ...data,
    };

    addDocumentNonBlocking(certificatesRef, newCertificate);
    
    toast({ title: "Sertifikat əlavə edildi", description: "Yeni sertifikatınız profilinizə əlavə olundu." });
    certificateForm.reset();
    setCertificateSaving(false);
  };


  if (isUserLoading || !student) {
    return <div className="container mx-auto py-8 text-center">Yüklənir...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Profilimi Redaktə Et</h1>
        <p className="text-muted-foreground">Profil məlumatlarınızı, layihə və nailiyyətlərinizi buradan idarə edin.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserIcon /> Şəxsi Məlumatlar</CardTitle>
            <CardDescription>Əsas profil məlumatlarınızı və sosial media hesablarınızı yeniləyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="firstName" control={profileForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="lastName" control={profileForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                {/* Other fields... */}
                <Separator />
                <h3 className="text-lg font-medium">Sosial Linklər</h3>
                 <FormField name="linkedInURL" control={profileForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="githubURL" control={profileForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField name="behanceURL" control={profileForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Behance URL</FormLabel>
                      <FormControl><Input placeholder="https://behance.net/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField name="portfolioURL" control={profileForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio URL</FormLabel>
                      <FormControl><Input placeholder="https://sizin-saytiniz.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <Button type="submit" disabled={isProfileSaving}>
                  {isProfileSaving ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Yadda Saxla'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Projects Form */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase /> Layihələr</CardTitle>
                <CardDescription>Gördüyünüz işləri və layihələri profilinizə əlavə edin.</CardDescription>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="role" control={projectForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Rolunuz</FormLabel><FormControl><Input {...field} placeholder="Məs: Developer, Dizayner" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="status" control={projectForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="davam edir">Davam edir</SelectItem>
                                        <SelectItem value="tamamlanıb">Tamamlanıb</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField name="link" control={projectForm.control} render={({ field }) => (
                           <FormItem><FormLabel>Layihə Linki (GitHub, Vebsayt və s.)</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={isProjectSaving}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {isProjectSaving ? 'Əlavə edilir...' : 'Layihə Əlavə Et'}
                        </Button>
                    </form>
                </Form>
                 <Separator className="my-6" />
                <h4 className="text-md font-medium mb-4">Mövcud Layihələr</h4>
                <div className="space-y-4">
                    {projectsLoading ? <p>Yüklənir...</p> : projects?.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 border rounded-md">
                            <span>{p.title}</span>
                            <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        {/* Achievements Form */}
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award /> Nailiyyətlər</CardTitle>
                <CardDescription>Qazandığınız uğurları və mükafatları qeyd edin.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...achievementForm}>
                    <form onSubmit={achievementForm.handleSubmit(onAchievementSubmit)} className="space-y-4">
                         <FormField name="name" control={achievementForm.control} render={({ field }) => (
                            <FormItem><FormLabel>Nailiyyətin Adı (Müsabiqə, Olimpiada və s.)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField name="position" control={achievementForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Tutduğunuz Yer/Dərəcə</FormLabel><FormControl><Input {...field} placeholder="Məs: 1-ci yer, Qızıl medal" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="level" control={achievementForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Səviyyə</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {(['Universitet', 'Regional', 'Respublika', 'Beynəlxalq'] as AchievementLevel[]).map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage /></FormItem>
                            )} />
                             <FormField name="date" control={achievementForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Tarix</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <Button type="submit" disabled={isAchievementSaving}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {isAchievementSaving ? 'Əlavə edilir...' : 'Nailiyyət Əlavə Et'}
                        </Button>
                    </form>
                </Form>
                 <Separator className="my-6" />
                <h4 className="text-md font-medium mb-4">Mövcud Nailiyyətlər</h4>
                <div className="space-y-4">
                    {achievementsLoading ? <p>Yüklənir...</p> : achievements?.map(a => (
                        <div key={a.id} className="flex justify-between items-center p-2 border rounded-md">
                            <span>{a.name} - {a.position}</span>
                            <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        {/* Certificates Form */}
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> Sertifikatlar</CardTitle>
                <CardDescription>Əldə etdiyiniz sertifikatları profilinizə əlavə edin.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...certificateForm}>
                    <form onSubmit={certificateForm.handleSubmit(onCertificateSubmit)} className="space-y-4">
                        <FormField name="name" control={certificateForm.control} render={({ field }) => (
                           <FormItem><FormLabel>Sertifikatın Adı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="certificateURL" control={certificateForm.control} render={({ field }) => (
                            <FormItem><FormLabel>Sertifikat Linki</FormLabel><FormControl><Input type="url" placeholder="Sertifikatın yükləndiyi link (Google Drive, Dropbox və s.)" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField name="level" control={certificateForm.control} render={({ field }) => (
                            <FormItem><FormLabel>Səviyyə</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                     {(['Universitet', 'Regional', 'Respublika', 'Beynəlxalq'] as CertificateLevel[]).map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={isCertificateSaving}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {isCertificateSaving ? 'Əlavə edilir...' : 'Sertifikat Əlavə Et'}
                        </Button>
                    </form>
                </Form>
                 <Separator className="my-6" />
                <h4 className="text-md font-medium mb-4">Mövcud Sertifikatlar</h4>
                <div className="space-y-4">
                    {certificatesLoading ? <p>Yüklənir...</p> : certificates?.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-2 border rounded-md">
                            <a href={c.certificateURL} target="_blank" rel="noopener noreferrer" className="hover:underline">{c.name}</a>
                            <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
