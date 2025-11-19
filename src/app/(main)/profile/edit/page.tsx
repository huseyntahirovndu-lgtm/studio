'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Student, Project, Achievement, Certificate, AchievementLevel, CertificateLevel } from '@/types';
import { calculateTalentScore } from '@/ai/flows/talent-scoring';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, Award, Briefcase, FileText, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Schemas
const profileSchema = z.object({
  firstName: z.string().min(2, "Ad ən azı 2 hərf olmalıdır."),
  lastName: z.string().min(2, "Soyad ən azı 2 hərf olmalıdır."),
  major: z.string().min(2, "İxtisas boş ola bilməz."),
  courseYear: z.coerce.number().min(1).max(4),
  skills: z.string().min(1, "Bacarıqlar boş ola bilməz.").transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
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

  const [isSaving, setIsSaving] = useState(false);
  
  const projectsRef = useMemoFirebase(() => user ? collection(firestore!, 'users', user.uid, 'projects') : null, [firestore, user]);
  const achievementsRef = useMemoFirebase(() => user ? collection(firestore!, 'users', user.uid, 'achievements') : null, [firestore, user]);
  const certificatesRef = useMemoFirebase(() => user ? collection(firestore!, 'users', user.uid, 'certificates') : null, [firestore, user]);
  
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsRef);
  const { data: achievements, isLoading: achievementsLoading } = useCollection<Achievement>(achievementsRef);
  const { data: certificates, isLoading: certificatesLoading } = useCollection<Certificate>(certificatesRef);

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

  useEffect(() => {
    if (!isUserLoading && (!user || student?.role !== 'student')) {
      router.push('/login');
    }
  }, [user, isUserLoading, student, router]);

  useEffect(() => {
    if (student) {
      profileForm.reset({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        major: student.major || '',
        courseYear: student.courseYear || 1,
        skills: student.skills?.join(', ') || '',
        linkedInURL: student.linkedInURL || '',
        githubURL: student.githubURL || '',
        behanceURL: student.behanceURL || '',
        portfolioURL: student.portfolioURL || '',
      });
    }
  }, [student, profileForm]);

  const triggerTalentScoreUpdate = useCallback(async () => {
    if (!user || !firestore) return;
    setIsSaving(true);
    toast({ title: "İstedad Balı Hesablanır...", description: "Profiliniz yenilənir, bu bir az vaxt ala bilər." });

    try {
        const userDocRef = doc(firestore, 'users', user.uid);
        
        // Fetch all data for the profile
        const studentDoc = await getDoc(userDocRef);
        const studentData = studentDoc.data() as Student;
        
        const projectsSnap = await getDocs(collection(firestore, 'users', user.uid, 'projects'));
        const achievementsSnap = await getDocs(collection(firestore, 'users', user.uid, 'achievements'));
        const certificatesSnap = await getDocs(collection(firestore, 'users', user.uid, 'certificates'));

        const fullProfile = {
            ...studentData,
            projects: projectsSnap.docs.map(d => d.data()),
            achievements: achievementsSnap.docs.map(d => d.data()),
            certificates: certificatesSnap.docs.map(d => d.data()),
        };
        
        // Calculate talent score
        const scoreResult = await calculateTalentScore({ profileData: JSON.stringify(fullProfile) });

        // Update score in Firestore
        updateDocumentNonBlocking(userDocRef, { talentScore: scoreResult.talentScore });

        toast({ title: "Profil Yeniləndi!", description: `Yeni istedad balınız: ${scoreResult.talentScore}. ${scoreResult.reasoning}` });
    } catch (error) {
        console.error("Error updating talent score:", error);
        toast({ variant: "destructive", title: "Xəta", description: "İstedad balını yeniləyərkən xəta baş verdi." });
    } finally {
        setIsSaving(false);
    }
  }, [user, firestore, toast]);

  const onProfileSubmit: SubmitHandler<z.infer<typeof profileSchema>> = async (data) => {
    if (!user || !firestore) return;
    setIsSaving(true);

    const userDocRef = doc(firestore, 'users', user.uid);
    const updatedData = { ...data, updatedAt: serverTimestamp() };

    await updateDoc(userDocRef, updatedData).catch(error => console.error(error));
    
    await triggerTalentScoreUpdate();
    setIsSaving(false);
  };
  
  const onProjectSubmit: SubmitHandler<z.infer<typeof projectSchema>> = async (data) => {
    if (!projectsRef) return;
    setIsSaving(true);

    const newProject: Omit<Project, 'id'> = { studentId: user!.uid, ...data };
    await addDoc(projectsRef, newProject).catch(error => console.error(error));
    
    toast({ title: "Layihə əlavə edildi" });
    projectForm.reset();
    await triggerTalentScoreUpdate();
    setIsSaving(false);
  };
  
  const onAchievementSubmit: SubmitHandler<z.infer<typeof achievementSchema>> = async (data) => {
    if (!achievementsRef) return;
    setIsSaving(true);
    
    const newAchievement: Omit<Achievement, 'id'> = { studentId: user!.uid, ...data };
    await addDoc(achievementsRef, newAchievement).catch(error => console.error(error));
    
    toast({ title: "Nailiyyət əlavə edildi" });
    achievementForm.reset();
    await triggerTalentScoreUpdate();
    setIsSaving(false);
  };
  
  const onCertificateSubmit: SubmitHandler<z.infer<typeof certificateSchema>> = async (data) => {
    if (!certificatesRef) return;
    setIsSaving(true);

    const newCertificate: Omit<Certificate, 'id'> = { studentId: user!.uid, ...data };
    await addDoc(certificatesRef, newCertificate).catch(error => console.error(error));
    
    toast({ title: "Sertifikat əlavə edildi" });
    certificateForm.reset();
    await triggerTalentScoreUpdate();
    setIsSaving(false);
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserIcon /> Şəxsi Məlumatlar</CardTitle>
            <CardDescription>Əsas profil məlumatlarınızı, bacarıqlarınızı və sosial media hesablarınızı yeniləyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="firstName" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Ad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="lastName" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Soyad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField name="major" control={profileForm.control} render={({ field }) => (
                        <FormItem><FormLabel>İxtisas</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField name="courseYear" control={profileForm.control} render={({ field }) => (
                        <FormItem><FormLabel>Təhsil ili</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value)}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                {[1,2,3,4].map(y => <SelectItem key={y} value={String(y)}>{y}-ci kurs</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage /></FormItem>
                    )} />
                 </div>
                 <FormField name="skills" control={profileForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bacarıqlar</FormLabel>
                      <FormControl><Input placeholder="Məs: React, Python, UI/UX" {...field} /></FormControl>
                      <FormDescription>Bacarıqları vergül ilə ayırın.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                <Separator />
                <h3 className="text-lg font-medium">Sosial Linklər</h3>
                 <FormField name="linkedInURL" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="githubURL" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField name="behanceURL" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Behance URL</FormLabel><FormControl><Input placeholder="https://behance.net/..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField name="portfolioURL" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Portfolio URL</FormLabel><FormControl><Input placeholder="https://sizin-saytiniz.com" {...field} /></FormControl><FormMessage /></FormItem>
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
                        <Button type="submit" disabled={isSaving}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {isSaving ? 'Əlavə edilir...' : 'Layihə Əlavə Et'}
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
                        <Button type="submit" disabled={isSaving}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {isSaving ? 'Əlavə edilir...' : 'Nailiyyət Əlavə Et'}
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
                        <Button type="submit" disabled={isSaving}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {isSaving ? 'Əlavə edilir...' : 'Sertifikat Əlavə Et'}
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

    