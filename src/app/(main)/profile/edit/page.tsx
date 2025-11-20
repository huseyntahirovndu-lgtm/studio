'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Student, Project, Achievement, Certificate, AchievementLevel, CertificateLevel, AppUser, Skill, SkillLevel } from '@/types';
import { calculateTalentScore } from '@/ai/flows/talent-scoring';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, Award, Briefcase, FileText, User as UserIcon, X, Book, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { getStudentById, getProjectsByStudentId, getAchievementsByStudentId, getCertificatesByStudentId, addProject, addAchievement, addCertificate, deleteProject, deleteAchievement, deleteCertificate } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';
import { uploadFile } from '@/services/file-upload';


const skillSchema = z.object({
    name: z.string().min(1, "Bacarıq adı boş ola bilməz."),
    level: z.enum(['Başlanğıc', 'Orta', 'İrəli']),
});

// Schemas
const profileSchema = z.object({
  firstName: z.string().min(2, "Ad ən azı 2 hərf olmalıdır."),
  lastName: z.string().min(2, "Soyad ən azı 2 hərf olmalıdır."),
  major: z.string().min(2, "İxtisas boş ola bilməz."),
  courseYear: z.coerce.number().min(1).max(4),
  educationForm: z.string().optional(),
  gpa: z.coerce.number().optional(),
  skills: z.array(skillSchema).min(1, "Ən azı bir bacarıq daxil edin."),
  linkedInURL: z.string().url().or(z.literal('')).optional(),
  githubURL: z.string().url().or(z.literal('')).optional(),
  behanceURL: z.string().url().or(z.literal('')).optional(),
  instagramURL: z.string().url().or(z.literal('')).optional(),
  portfolioURL: z.string().url().or(z.literal('')).optional(),
  googleScholarURL: z.string().url().or(z.literal('')).optional(),
  youtubeURL: z.string().url().or(z.literal('')).optional(),
});

const projectSchema = z.object({
  title: z.string().min(3, "Layihə adı boş ola bilməz."),
  description: z.string().min(10, "Təsvir ən azı 10 hərf olmalıdır."),
  role: z.string().min(2, "Rol boş ola bilməz."),
  teamMembers: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  link: z.string().url().or(z.literal('')),
  status: z.enum(['davam edir', 'tamamlanıb']),
});

const achievementSchema = z.object({
  name: z.string().min(3, "Nailiyyət adı boş ola bilməz."),
  description: z.string().optional(),
  position: z.string().min(1, "Dərəcə boş ola bilməz."),
  level: z.enum(['Beynəlxalq', 'Respublika', 'Regional', 'Universitet']),
  date: z.string().min(1, "Tarix boş ola bilməz."),
  link: z.string().url().or(z.literal('')),
});

const certificateSchema = z.object({
    name: z.string().min(3, "Sertifikat adı boş ola bilməz."),
    certificateFile: z.any().optional(),
    level: z.enum(['Beynəlxalq', 'Respublika', 'Regional', 'Universitet']),
}).refine(data => data.certificateFile, {
    message: "Sertifikat faylı təqdim edilməlidir.",
    path: ["certificateFile"],
});

const SKILL_LEVELS: SkillLevel[] = ['Başlanğıc', 'Orta', 'İrəli'];

function EditProfilePageComponent() {
  const { user: currentUser, loading, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [targetUser, setTargetUser] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Başlanğıc');
  const skillInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const userIdFromQuery = searchParams.get('userId');
    // Admin editing a specific user
    if (currentUser?.role === 'admin' && userIdFromQuery) {
      const student = getStudentById(userIdFromQuery);
      if (student) {
          setTargetUser(student);
      } else {
          toast({ variant: 'destructive', title: 'Xəta', description: 'Tələbə tapılmadı.' });
          router.push('/admin/students');
      }
    // Student editing their own profile
    } else if (currentUser?.role === 'student') {
      setTargetUser(currentUser as Student);
    // Not logged in or not authorized
    } else if (!loading) {
      router.push('/login');
    }
  }, [currentUser, searchParams, loading, router, toast]);


  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });
  
  const { control: profileControl, watch: watchProfile, setValue: setProfileValue, trigger: triggerProfile } = profileForm;
  const skills = watchProfile('skills', []);

  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: '', description: '', role: '', teamMembers: [], link: '', status: 'davam edir' }
  });

  const achievementForm = useForm<z.infer<typeof achievementSchema>>({
    resolver: zodResolver(achievementSchema),
    defaultValues: { name: '', description: '', position: '', level: 'Universitet', date: '', link: '' }
  });
  
  const certificateForm = useForm<z.infer<typeof certificateSchema>>({
    resolver: zodResolver(certificateSchema),
    defaultValues: { name: '', level: 'Universitet' }
  });

  const fetchData = useCallback(() => {
    if (!targetUser) return;
    setIsLoadingData(true);
    setProjects(getProjectsByStudentId(targetUser.id));
    setAchievements(getAchievementsByStudentId(targetUser.id));
    setCertificates(getCertificatesByStudentId(targetUser.id));
    setIsLoadingData(false);
  }, [targetUser]);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (targetUser) {
      profileForm.reset({
        firstName: targetUser.firstName || '',
        lastName: targetUser.lastName || '',
        major: targetUser.major || '',
        courseYear: targetUser.courseYear || 1,
        educationForm: targetUser.educationForm || '',
        gpa: targetUser.gpa || undefined,
        skills: targetUser.skills || [],
        linkedInURL: targetUser.linkedInURL || '',
        githubURL: targetUser.githubURL || '',
        behanceURL: targetUser.behanceURL || '',
        instagramURL: targetUser.instagramURL || '',
        portfolioURL: targetUser.portfolioURL || '',
        googleScholarURL: targetUser.googleScholarURL || '',
        youtubeURL: targetUser.youtubeURL || '',
      });
      fetchData();
    }
  }, [targetUser, profileForm, fetchData]);

  const triggerTalentScoreUpdate = useCallback(async (updatedStudentProfile: Student) => {
    if (!updatedStudentProfile) return;
    setIsSaving(true);
    toast({ title: "İstedad Balı Hesablanır...", description: "Profil yenilənir, bu bir az vaxt ala bilər." });

    try {
        const fullProfile = {
            ...updatedStudentProfile,
            projects: getProjectsByStudentId(updatedStudentProfile.id),
            achievements: getAchievementsByStudentId(updatedStudentProfile.id),
            certificates: getCertificatesByStudentId(updatedStudentProfile.id),
        };
        
        const scoreResult = await calculateTalentScore({ profileData: JSON.stringify(fullProfile) });
        
        const finalUpdatedStudent = { ...updatedStudentProfile, talentScore: scoreResult.talentScore };
        if (updateUser(finalUpdatedStudent as AppUser)) {
           // If current user is the one being edited, update the state
           if (currentUser?.id === finalUpdatedStudent.id) {
               setTargetUser(finalUpdatedStudent);
           }
        }

        toast({ title: "Profil Yeniləndi!", description: `Yeni istedad balınız: ${scoreResult.talentScore}. ${scoreResult.reasoning}` });
    } catch (error) {
        console.error("Error updating talent score:", error);
        toast({ variant: "destructive", title: "Xəta", description: "İstedad balını yeniləyərkən xəta baş verdi." });
    } finally {
        setIsSaving(false);
    }
  }, [toast, updateUser, currentUser]);

    const onProfileSubmit: SubmitHandler<z.infer<typeof profileSchema>> = (data) => {
      if (!targetUser) return;
      
      const updatedUser: Student = { ...targetUser, ...data };
      updateUser(updatedUser);
      triggerTalentScoreUpdate(updatedUser);
      toast({ title: "Profil məlumatları yeniləndi" });
    };
  
  const onProjectSubmit: SubmitHandler<z.infer<typeof projectSchema>> = (data) => {
    if (!targetUser) return;
    const newProject: Project = { ...data, id: uuidv4(), studentId: targetUser.id, teamMemberIds: [], invitedStudentIds: [] };
    addProject(newProject);
    const updatedStudent = {
      ...targetUser,
      projectIds: [...(targetUser.projectIds || []), newProject.id]
    };
    updateUser(updatedStudent);
    projectForm.reset();
    fetchData();
    triggerTalentScoreUpdate(updatedStudent);
    toast({ title: "Layihə əlavə edildi" });
  };
  
  const onAchievementSubmit: SubmitHandler<z.infer<typeof achievementSchema>> = (data) => {
    if (!targetUser) return;
    const newAchievement: Achievement = { ...data, id: uuidv4(), studentId: targetUser!.id };
    addAchievement(newAchievement);
    const updatedStudent = {
      ...targetUser,
      achievementIds: [...(targetUser.achievementIds || []), newAchievement.id]
    };
    updateUser(updatedStudent);
    achievementForm.reset();
    fetchData();
    triggerTalentScoreUpdate(updatedStudent);
    toast({ title: "Nailiyyət əlavə edildi" });
  };
  
 const onCertificateSubmit: SubmitHandler<z.infer<typeof certificateSchema>> = async (data) => {
    if (!targetUser) return;
    setIsSaving(true);
    let fileUrl = '';

    try {
      if (data.certificateFile && data.certificateFile.length > 0) {
        const file = data.certificateFile[0];
        toast({ title: "Fayl Yüklənir...", description: "Sertifikatınız serverə yüklənir." });
        const response = await uploadFile(file);
        fileUrl = response.url;
      }

      const newCertificate: Certificate = {
        name: data.name,
        level: data.level,
        certificateURL: fileUrl,
        id: uuidv4(),
        studentId: targetUser!.id,
      };

      addCertificate(newCertificate);
      const updatedStudent = {
        ...targetUser,
        certificateIds: [...(targetUser.certificateIds || []), newCertificate.id],
      };
      updateUser(updatedStudent);
      certificateForm.reset();
      fetchData();
      triggerTalentScoreUpdate(updatedStudent);
      toast({ title: "Sertifikat əlavə edildi" });

    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast({ variant: "destructive", title: "Xəta", description: "Sertifikat yüklənərkən xəta baş verdi." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (docId: string, itemType: 'project' | 'achievement' | 'certificate') => {
      if (!targetUser) return;
      
      let updatedStudent: Student = { ...targetUser };

      switch (itemType) {
          case 'project': 
            deleteProject(docId, targetUser.id); 
            updatedStudent.projectIds = updatedStudent.projectIds?.filter(id => id !== docId);
            break;
          case 'achievement': 
            deleteAchievement(docId, targetUser.id);
            updatedStudent.achievementIds = updatedStudent.achievementIds?.filter(id => id !== docId);
            break;
          case 'certificate': 
            deleteCertificate(docId, targetUser.id); 
            updatedStudent.certificateIds = updatedStudent.certificateIds?.filter(id => id !== docId);
            break;
      }
      
      updateUser(updatedStudent);
      fetchData();
      triggerTalentScoreUpdate(updatedStudent);
      toast({ title: "Element silindi", description: "Seçilmiş element uğurla silindi." });
  };

  const handleSkillAdd = async () => {
    const trimmedInput = skillInput.trim();
    if (trimmedInput) {
        const newSkill: Skill = { name: trimmedInput, level: skillLevel };
        const currentSkills = profileForm.getValues('skills') || [];
        if (!currentSkills.some(s => s && s.name && s.name.toLowerCase() === newSkill.name.toLowerCase())) {
            setProfileValue('skills', [...currentSkills, newSkill], { shouldValidate: true });
            setSkillInput('');
            setSkillLevel('Başlanğıc');
            skillInputRef.current?.focus();
        } else {
            toast({ variant: 'destructive', title: 'Bu bacarıq artıq mövcuddur.' });
        }
    }
};

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileValue('skills', skills.filter(skill => skill.name !== skillToRemove));
  };


  if (loading || !targetUser) {
    return <div className="container mx-auto py-8 text-center">Yüklənir...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Profili Redaktə Et</h1>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="educationForm" control={profileForm.control} render={({ field }) => (
                      <FormItem><FormLabel>Təhsil Forması</FormLabel><FormControl><Input {...field} placeholder="Əyani / Qiyabi" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="gpa" control={profileForm.control} render={({ field }) => (
                      <FormItem><FormLabel>ÜOMG (GPA)</FormLabel><FormControl><Input type="number" step="0.1" {...field} placeholder="Məs: 85.5" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                 <FormField name="skills" control={profileControl} render={() => (
                    <FormItem>
                        <FormLabel>Bacarıqlar</FormLabel>
                        <div className="flex items-center gap-2">
                            <Input
                                ref={skillInputRef}
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSkillAdd(); } }}
                                placeholder="Bacarıq adı"
                            />
                            <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Səviyyə seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SKILL_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button type="button" onClick={handleSkillAdd}>Əlavə et</Button>
                        </div>
                        <FormMessage />
                        <div className="flex flex-wrap gap-2 pt-2">
                            {skills.map((skill) => (
                                <Badge key={skill.name} variant="secondary" className="flex items-center gap-2 text-sm">
                                    {skill.name} <span className="text-xs opacity-70">({skill.level})</span>
                                    <button type="button" onClick={() => handleSkillRemove(skill.name)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
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
                   <FormField name="instagramURL" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField name="portfolioURL" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Portfolio URL</FormLabel><FormControl><Input placeholder="https://sizin-saytiniz.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="googleScholarURL" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Google Scholar URL</FormLabel><FormControl><Input placeholder="https://scholar.google.com/citations?user=..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="youtubeURL" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>YouTube URL</FormLabel><FormControl><Input placeholder="https://youtube.com/channel/..." {...field} /></FormControl><FormMessage /></FormItem>
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
                        <FormField name="teamMembers" control={projectForm.control} render={({ field }) => (
                            <FormItem><FormLabel>Komanda Üzvləri</FormLabel><FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : ''} placeholder="Adları vergül ilə ayırın" /></FormControl><FormMessage /></FormItem>
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
                    {isLoadingData ? <p>Yüklənir...</p> : projects?.map(p => (
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
                                        Bu əməliyyat geri qaytarıla bilməz. "{p.title}" adlı layihə profilinizdən həmişəlik silinəcək.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(p.id, 'project')} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
                        <FormField name="description" control={achievementForm.control} render={({ field }) => (
                            <FormItem><FormLabel>Təsvir (Könüllü)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="date" control={achievementForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Tarix</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="link" control={achievementForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Təsdiq Linki (Könüllü)</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
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
                    {isLoadingData ? <p>Yüklənir...</p> : achievements?.map(a => (
                        <div key={a.id} className="flex justify-between items-center p-2 border rounded-md">
                            <span>{a.name} - {a.position}</span>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={isSaving}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Silməni təsdiq edirsiniz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bu əməliyyat geri qaytarıla bilməz. "{a.name}" adlı nailiyyət profilinizdən həmişəlik silinəcək.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(a.id, 'achievement')} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> Sertifikatlar</CardTitle>
            <CardDescription>
              Əldə etdiyiniz sertifikatları profilinizə əlavə edin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...certificateForm}>
              <form onSubmit={certificateForm.handleSubmit(onCertificateSubmit)} className="space-y-4">
                <FormField name="name" control={certificateForm.control} render={({ field }) => (
                  <FormItem><FormLabel>Sertifikatın Adı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField
                  control={certificateForm.control}
                  name="certificateFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Sertifikat Faylı (Şəkil və ya PDF)</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*,application/pdf" onChange={e => onChange(e.target.files)} {...rest} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              {isLoadingData ? <p>Yüklənir...</p> : certificates?.map(c => (
                <div key={c.id} className="flex justify-between items-center p-2 border rounded-md">
                  <a href={c.certificateURL} target="_blank" rel="noopener noreferrer" className="hover:underline">{c.name}</a>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isSaving}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Silməni təsdiq edirsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu əməliyyat geri qaytarıla bilməz. "{c.name}" adlı sertifikat profilinizdən həmişəlik silinəcək.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(c.id, 'certificate')} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={<div>Yüklənir...</div>}>
      <EditProfilePageComponent />
    </Suspense>
  )
}

    