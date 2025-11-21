'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Users,
  Building,
  Trophy,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { StudentCard } from '@/components/student-card';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { FacultyBarChart } from '@/components/charts/faculty-bar-chart';
import { Student, Project, Organization, FacultyData, CategoryData, Achievement, News, StudentOrganization, Invitation } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, orderBy, limit, writeBatch, doc } from 'firebase/firestore';
import { selectTopStories } from '@/ai/flows/story-selector';
import { format } from 'date-fns';


interface EnrichedProject extends Project {
    student?: Student;
}

interface OrgProject extends Project {
    organization: Organization;
}

interface SuccessStory {
    studentId: string;
    name: string;
    faculty: string;
    story: string;
    profilePictureUrl?: string;
}

const SuccessStoryCard = ({ story }: { story: SuccessStory }) => (
    <Card className="flex flex-col overflow-hidden">
         <CardHeader className="flex flex-row items-start gap-4">
            <Link href={`/profile/${story.studentId}`} className="flex items-center gap-4 group">
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={story.profilePictureUrl} alt={story.name} />
                    <AvatarFallback>{story.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="group-hover:underline">{story.name}</CardTitle>
                    <CardDescription>{story.faculty}</CardDescription>
                </div>
            </Link>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">"{story.story}"</p>
        </CardContent>
    </Card>
);

const OrganizationProjectCard = ({ project }: { project: OrgProject }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const firestore = useFirestore();
    const student = user as Student;

    const [isApplied, setIsApplied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (student && project.applicantIds?.includes(student.id)) {
            setIsApplied(true);
        }
    }, [student, project]);

    const handleApply = async () => {
        if (!user || user.role !== 'student') {
            toast({ variant: 'destructive', title: "Xəta", description: "Müraciət etmək üçün tələbə kimi daxil olmalısınız." });
            return;
        }

        const isAlreadyMember = (project.teamMemberIds || []).includes(user.id);
        if(isAlreadyMember) {
            toast({ variant: 'destructive', title: "Xəta", description: "Siz artıq bu layihənin üzvüsünüz." });
            return;
        }

        if(isApplied) {
            toast({ title: "Müraciətiniz Qeydə Alınıb", description: "Bu layihəyə artıq müraciət etmisiniz." });
            return;
        }

        setIsLoading(true);

        const batch = writeBatch(firestore);

        const projectRef = doc(firestore, 'projects', project.id);
        const newApplicants = [...(project.applicantIds || []), student.id];
        batch.update(projectRef, { applicantIds: newApplicants });
        
        const invitationRef = doc(collection(firestore, 'invitations'));
        const newInvitation: Invitation = {
            id: invitationRef.id,
            organizationId: project.organization.id,
            studentId: student.id,
            projectId: project.id,
            status: 'müraciət',
            createdAt: new Date(),
        };
        batch.set(invitationRef, newInvitation);

        try {
            await batch.commit();
            setIsApplied(true);
            toast({ title: "Müraciət Göndərildi", description: `"${project.title}" layihəsinə müraciətiniz uğurla göndərildi.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Xəta", description: "Müraciət göndərilərkən xəta baş verdi." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                 <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={project.organization.logoUrl} />
                        <AvatarFallback>{project.organization.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription>{project.organization.name}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleApply} disabled={isApplied || isLoading} className="w-full">
                    {isLoading ? 'Göndərilir...' : (isApplied ? 'Müraciət Edilib' : 'Müraciət Et')}
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function HomePage() {
  const firestore = useFirestore();

  const studentsQuery = useMemoFirebase(() => query(collection(firestore, "users"), where("status", "==", "təsdiqlənmiş"), where("role", "==", "student")), [firestore]);
  const projectsQuery = useMemoFirebase(() => collection(firestore, "projects"), [firestore]);
  const organizationsQuery = useMemoFirebase(() => query(collection(firestore, "users"), where("role", "==", "organization")), [firestore]);
  const categoriesQuery = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const achievementsQuery = useMemoFirebase(() => collection(firestore, "achievements"), [firestore]);
  const newsQuery = useMemoFirebase(() => query(collection(firestore, 'news'), orderBy('createdAt', 'desc'), limit(3)), [firestore]);
  const studentOrgsQuery = useMemoFirebase(() => query(collection(firestore, 'student-organizations'), limit(3)), [firestore]);

  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);
  const { data: organizations, isLoading: orgsLoading } = useCollection<Organization>(organizationsQuery);
  const { data: categories, isLoading: categoriesLoading } = useCollection<CategoryData>(categoriesQuery);
  const { data: achievements, isLoading: achievementsLoading } = useCollection<Achievement>(achievementsQuery);
  const { data: latestNews, isLoading: newsLoading } = useCollection<News>(newsQuery);
  const { data: studentOrgs, isLoading: studentOrgsLoading } = useCollection<StudentOrganization>(studentOrgsQuery);
  
  const [topTalents, setTopTalents] = useState<Student[]>([]);
  const [newMembers, setNewMembers] = useState<Student[]>([]);
  const [strongestProjects, setStrongestProjects] = useState<EnrichedProject[]>([]);
  const [organizationProjects, setOrganizationProjects] = useState<OrgProject[]>([]);
  const [popularSkills, setPopularSkills] = useState<string[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  
  const isLoading = studentsLoading || projectsLoading || orgsLoading || categoriesLoading || achievementsLoading || newsLoading || studentOrgsLoading;

  useEffect(() => {
    if (!students || students.length === 0) return;

    const sortedByTalent = [...students].sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0));
    setTopTalents(sortedByTalent.slice(0, 10));

    const sortedByDate = [...students].sort((a, b) => (a.createdAt && b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0));
    setNewMembers(sortedByDate.slice(0, 5));
    
    const allSkills = students.flatMap(s => s.skills || []).map(s => s.name);
    const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);
    setPopularSkills(sortedSkills.slice(0, 10));
    
    const fetchStories = async () => {
        const storiesToConsider = students
            .filter(s => s.successStory && s.successStory.trim().length > 10)
            .map(s => ({ id: s.id, firstName: s.firstName, lastName: s.lastName, faculty: s.faculty, successStory: s.successStory!, profilePictureUrl: s.profilePictureUrl }));
        
        if (storiesToConsider.length > 0) {
            try {
                const result = await selectTopStories({ stories: storiesToConsider });
                setSuccessStories(result.selectedStories.map(s => ({...s, profilePictureUrl: storiesToConsider.find(stc => stc.id === s.studentId)?.profilePictureUrl})));
            } catch (error) {
                console.error("AI story selection failed, using fallback:", error);
                setSuccessStories(storiesToConsider.slice(0, 2).map(s => ({
                     studentId: s.id,
                     name: `${s.firstName} ${s.lastName}`,
                     faculty: s.faculty,
                     story: s.successStory,
                     profilePictureUrl: s.profilePictureUrl
                })));
            }
        }
    };
    fetchStories();

  }, [students]);

   useEffect(() => {
    if (!projects || !students || !organizations) return;
    
    const studentProjects = projects.filter(p => students.some(s => s.id === p.studentId));
    
    const enrichProjects = async () => {
        const enriched = await Promise.all(studentProjects.map(async p => {
            return {
                ...p,
                student: students.find(s => s.id === p.studentId)
            }
        }));
         setStrongestProjects(enriched.slice(0, 3));
    }
    enrichProjects();
    

    const orgProjects = projects.filter(p => organizations.some(o => o.id === p.studentId));
    const enrichedOrgProjects = orgProjects.map(p => ({
        ...p,
        organization: organizations.find(o => o.id === p.studentId)!
    })).slice(0, 3);
    setOrganizationProjects(enrichedOrgProjects);

   }, [projects, students, organizations, firestore]);


  return (
    <div className="flex flex-col">
       <main className="flex-1">
        <section className="relative w-full h-screen">
            <Image
              src="https://i.ibb.co/cXv2KzRR/q2.jpg"
              alt="Naxçıvan Dövlət Universiteti"
              fill
              className="object-cover"
              priority
              data-ai-hint="university campus students"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative h-full flex items-center">
              <div className="container mx-auto">
                <div className="max-w-3xl text-white">
                  <p className="text-xl md:text-2xl font-medium tracking-tight drop-shadow-md">Naxçıvan Dövlət Universiteti</p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter drop-shadow-lg text-primary mt-1">
                     İstedad Mərkəzi
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg text-white/90 drop-shadow-md">
                      Tələbələrimizin bacarıqlarını, layihələrini və nailiyyətlərini kəşf edin. Potensialı reallığa çevirən platforma.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg">
                          <Link href="/search">İstedadları Kəşf Et <ArrowRight className="ml-2" /></Link>
                      </Button>
                      <Button asChild size="lg" variant="secondary">
                          <Link href="/register-student">Platformaya Qoşul</Link>
                      </Button>
                  </div>
                </div>
              </div>
            </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="py-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Ümumi Tələbə Sayı"
                value={isLoading ? '...' : (students?.length.toString() ?? '0')}
                icon={Users}
              />
              <StatCard
                title="Aktiv Təşkilat"
                value={isLoading ? '...' : (organizations?.length.toString() ?? '0')}
                icon={Building}
              />
              <StatCard
                title="Aktiv Layihələr"
                value={isLoading ? '...' : (projects?.length.toString() ?? '0')}
                icon={Lightbulb}
              />
              <StatCard
                title="Ümumi Uğurlar"
                value={isLoading ? '...' : (achievements?.length.toString() ?? '0')}
                icon={Trophy}
              />
            </div>
          </section>

          <section className="py-12">
             <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Son Xəbərlər</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Universitet və tələbə həyatı ilə bağlı ən son yeniliklər.</p>
            </div>
            {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {latestNews && latestNews.length > 0 ? latestNews.map(news => (
                        <Card key={news.id} className="overflow-hidden group">
                           <Link href={`/məqalələr/${news.slug}`}>
                                <div className="relative h-56 w-full">
                                    <Image src={news.coverImageUrl || 'https://picsum.photos/seed/news/600/400'} alt={news.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105"/>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2 group-hover:text-primary">{news.title}</CardTitle>
                                    <CardDescription>{news.createdAt ? format(news.createdAt.toDate(), 'dd MMMM, yyyy') : ''}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="line-clamp-3 text-sm text-muted-foreground">{news.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                                </CardContent>
                           </Link>
                        </Card>
                    )) : (
                         <p className="text-center col-span-full text-muted-foreground">Hazırda heç bir xəbər yoxdur.</p>
                    )}
                </div>
            )}
             <div className="text-center mt-8">
                <Button asChild variant="outline">
                    <Link href="/məqalələr">Bütün Xəbərlər <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
          </section>

          <section className="py-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Top 10 İstedad
              </h2>
              <Button variant="ghost" asChild>
                <Link href="/rankings">
                  Bütün reytinqlərə bax <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
             {isLoading ? (
               <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {Array.from({length: 10}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
               </div>
             ) : (
               <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {topTalents.map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </div>
             )}
          </section>
          
           <section className="py-12 bg-muted -mx-4 px-4 rounded-lg">
               <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold">Tələbə Təşkilatları</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Universitetimizin aktiv tələbə təşkilatları ilə tanış olun və fəaliyyətlərinə qoşulun.</p>
              </div>
               {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <Skeleton className="h-48 w-full" />
                          <Skeleton className="h-48 w-full" />
                          <Skeleton className="h-48 w-full" />
                      </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {studentOrgs && studentOrgs.length > 0 ? studentOrgs.map(org => (
                           <Card key={org.id} className="hover:shadow-lg transition-shadow">
                             <Link href={`/student-organizations/${org.id}`}>
                                <CardHeader className="flex-row gap-4 items-center">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={org.logoUrl} alt={org.name} />
                                        <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle>{org.name}</CardTitle>
                                        <CardDescription>{org.faculty}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>
                                </CardContent>
                            </Link>
                        </Card>
                      )) : (
                          <p className="text-center col-span-full text-muted-foreground">Heç bir tələbə təşkilatı tapılmadı.</p>
                      )}
                  </div>
              )}
                <div className="text-center mt-8">
                    <Button asChild variant="outline">
                        <Link href="/student-organizations">Bütün Təşkilatlar <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
          </section>

          <section className="py-12 bg-muted -mx-4 px-4 rounded-lg">
               <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold">Aktiv Təşkilat Layihələri</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Tərəfdaş təşkilatlarımızın təqdim etdiyi layihələrə qoşulun və real təcrübə qazanın.</p>
              </div>
               {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <Skeleton className="h-48 w-full" />
                          <Skeleton className="h-48 w-full" />
                          <Skeleton className="h-48 w-full" />
                      </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {organizationProjects.length > 0 ? organizationProjects.map(project => (
                          <OrganizationProjectCard key={project.id} project={project} />
                      )) : (
                          <p className="text-center col-span-full text-muted-foreground">Hazırda aktiv təşkilat layihəsi yoxdur.</p>
                      )}
                  </div>
              )}
          </section>
          
          <section className="py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Ən Güclü Tələbə Layihələri</h2>
                  {isLoading ? (
                       <div className="space-y-4">
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-32 w-full" />
                      </div>
                  ) : (
                      <div className="space-y-6">
                          {strongestProjects.length > 0 ? strongestProjects.map(project => (
                              <Link key={project.id} href={`/profile/${project.student?.id}`} className="block">
                                  <Card className="hover:shadow-md hover:border-primary/50 transition-all">
                                      <CardHeader>
                                          <CardTitle className="text-lg">{project.title}</CardTitle>
                                          <CardDescription>
                                              <div className="flex items-center gap-2">
                                                  <Avatar className="h-6 w-6">
                                                      <AvatarImage src={project.student?.profilePictureUrl} />
                                                      <AvatarFallback>{project.student?.firstName?.[0]}{project.student?.lastName?.[0]}</AvatarFallback>
                                                  </Avatar>
                                                  <span>{project.student?.firstName} {project.student?.lastName}</span>
                                              </div>
                                          </CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                      </CardContent>
                                  </Card>
                              </Link>
                          )) : (
                               <p className="text-center text-muted-foreground py-10">Göstərmək üçün tələbə layihəsi tapılmadı.</p>
                          )}
                      </div>
                  )}
              </div>
               <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Populyar Bacarıqlar</h2>
                  {isLoading ? (
                      <div className="flex flex-wrap gap-2">
                          {Array.from({length: 10}).map((_, i) => <Skeleton key={i} className="h-8 w-24" />)}
                      </div>
                  ) : (
                      <div className="flex flex-wrap gap-3">
                          {popularSkills.length > 0 ? popularSkills.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-base px-4 py-2">{skill}</Badge>
                          )) : (
                             <p className="text-muted-foreground">Heç bir bacarıq tapılmadı.</p>
                          )}
                      </div>
                  )}
              </div>
          </section>

          <section className="py-12">
             <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <CategoryPieChart students={students || []} categoriesData={categories || []} />
                </div>
                <div className="lg:col-span-3">
                    <FacultyBarChart students={students || []} />
                </div>
            </div>
          </section>
          
          <section className="py-12">
              <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold">Tələbə Uğur Hekayələri</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Platformamızın tələbələrimizin karyera yoluna necə təsir etdiyini kəşf edin.</p>
              </div>
              {isLoading ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-48 w-full" />
                  </div>
              ) : successStories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {successStories.map(story => (
                          <SuccessStoryCard key={story.studentId} story={story} />
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-10 text-muted-foreground">
                      <p>Hələlik paylaşılacaq uğur hekayəsi yoxdur.</p>
                  </div>
              )}
          </section>


          <section className="py-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Yeni Qoşulanlar
              </h2>
               <Button variant="ghost" asChild>
                <Link href="/search?sort=newest">
                  Hamısına bax <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {isLoading ? (
               <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
               </div>
             ) : (
              <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {newMembers.map((student) => (
                  <StudentCard key={student.id} student={student} />
                  ))}
              </div>
             )}
          </section>
        </div>
      </main>
    </div>
  );
}
