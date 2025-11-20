'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Users,
  Building,
  Trophy,
  Lightbulb,
  Sparkles,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { StudentCard } from '@/components/student-card';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { FacultyBarChart } from '@/components/charts/faculty-bar-chart';
import { Student, Project, Certificate, Organization } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudents, getProjects, getCertificates, getFaculties, getStudentById, getOrganizations, addInvitation } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface EnrichedProject extends Project {
    student?: Student;
}

interface OrgProject extends Project {
    organization: Organization;
}


const SuccessStoryCard = ({ story }: { story: { name: string, faculty: string, story: string, imageUrl: string, imageHint: string } }) => (
    <Card className="flex flex-col overflow-hidden">
        <Image src={story.imageUrl} alt={story.name} width={400} height={250} className="w-full h-48 object-cover" data-ai-hint={story.imageHint} />
        <CardHeader>
            <CardTitle>{story.name}</CardTitle>
            <CardDescription>{story.faculty}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">"{story.story}"</p>
        </CardContent>
    </Card>
);

const OrganizationProjectCard = ({ project }: { project: OrgProject }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleApply = () => {
        if (!user || user.role !== 'student') {
            toast({ variant: 'destructive', title: "Xəta", description: "Müraciət etmək üçün tələbə kimi daxil olmalısınız." });
            return;
        }

        const isAlreadyMember = (project.teamMemberIds || []).includes(user.id);
        const isAlreadyApplicant = (project.applicantIds || []).includes(user.id);

        if(isAlreadyMember) {
            toast({ variant: 'destructive', title: "Xəta", description: "Siz artıq bu layihənin üzvüsünüz." });
            return;
        }

        if(isAlreadyApplicant) {
            toast({ title: "Müraciətiniz Qeydə Alınıb", description: "Bu layihəyə artıq müraciət etmisiniz." });
            return;
        }

        const application: Invitation = {
            id: uuidv4(),
            organizationId: project.organization.id,
            studentId: user.id,
            projectId: project.id,
            status: 'müraciət',
            createdAt: new Date(),
        };

        addInvitation(application, project.id);
        toast({ title: "Müraciət Göndərildi", description: `"${project.title}" layihəsinə müraciətiniz uğurla göndərildi.` });
    };

    return (
        <Card>
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
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
                <Button onClick={handleApply} className="w-full">
                    <Briefcase className="mr-2 h-4 w-4" /> Müraciət Et
                </Button>
            </CardContent>
        </Card>
    );
};


export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [topTalents, setTopTalents] = useState<Student[]>([]);
  const [newMembers, setNewMembers] = useState<Student[]>([]);
  const [strongestProjects, setStrongestProjects] = useState<EnrichedProject[]>([]);
  const [organizationProjects, setOrganizationProjects] = useState<OrgProject[]>([]);
  const [popularSkills, setPopularSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const faculties = getFaculties();

  const successStories = [
      {
          name: "Aysel Məmmədova",
          faculty: "İqtisadiyyat və idarəetmə",
          story: "İstedad Mərkəzi sayəsində Tech Solutions şirkətində təcrübə proqramına qatıldım və maliyyə analitikası sahəsində ilk real iş təcrübəmi qazandım.",
          imageUrl: PlaceHolderImages[0].imageUrl,
          imageHint: PlaceHolderImages[0].imageHint,
      },
      {
          name: "Orxan Əliyev",
          faculty: "Memarlıq və mühəndislik",
          story: "Platformada yaratdığım layihə portfoliom bir startapın diqqətini çəkdi və indi mobil tətbiqlərinin UX/UI dizaynı üzərində işləyirəm.",
          imageUrl: PlaceHolderImages[1].imageUrl,
          imageHint: PlaceHolderImages[1].imageHint,
      }
  ];

  useEffect(() => {
    // Simulate fetching data
    const allStudents = getStudents().filter(s => s.status === 'təsdiqlənmiş');
    const enrichedStudents = allStudents.map((student, index) => {
      const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
      return {
        ...student,
        profilePictureUrl: placeholder.imageUrl,
        profilePictureHint: placeholder.imageHint,
      };
    });

    setStudents(enrichedStudents);

    // Top 10 Talents
    const sortedByTalent = [...enrichedStudents].sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0));
    setTopTalents(sortedByTalent.slice(0, 10));
    
    // Strongest Student Projects (from top 5 students)
    const allProjects = getProjects();
    const topStudentIds = sortedByTalent.slice(0,5).map(s => s.id);
    const projectsFromTopStudents: EnrichedProject[] = allProjects
        .filter(p => topStudentIds.includes(p.studentId))
        .map(p => ({
            ...p,
            student: getStudentById(p.studentId)
        }));
    setStrongestProjects(projectsFromTopStudents.slice(0, 3));
    
     // Organization Projects
    const organizations = getOrganizations();
    const orgProjects: OrgProject[] = organizations.flatMap(org => 
        (org.projectIds || [])
            .map(projectId => getProjects().find(p => p.id === projectId))
            .filter((p): p is Project => !!p)
            .map(p => ({ ...p, organization: org }))
    ).slice(0, 3); // take first 3 org projects
    setOrganizationProjects(orgProjects);
    
    // Popular skills
    const allSkills = enrichedStudents.flatMap(s => s.skills).map(s => s.name);
    const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);
    setPopularSkills(sortedSkills.slice(0, 10));


    const sortedByDate = [...enrichedStudents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNewMembers(sortedByDate.slice(0, 5));
    
    setIsLoading(false);
  }, []);

  const totalAchievements = students.reduce((acc, s) => acc + (s.achievementIds?.length || 0), 0);
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
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
                        <Link href="/register">Platformaya Qoşul</Link>
                    </Button>
                </div>
              </div>
            </div>
          </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Statistics Section */}
        <section className="py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Ümumi Tələbə Sayı"
              value={isLoading ? '...' : (getStudents().length.toString() ?? '0')}
              icon={Users}
            />
            <StatCard
              title="Aktiv Profillər"
              value={isLoading ? '...' : (students?.length.toString() ?? '0')}
              icon={Users}
            />
            <StatCard
              title="Fakültə Sayı"
              value={isLoading ? '...' : (faculties?.length.toString() ?? '0')}
              icon={Building}
            />
            <StatCard
              title="Ümumi Uğurlar"
              value={isLoading ? '...' : totalAchievements.toString()}
              icon={Trophy}
            />
          </div>
        </section>

        {/* Top 10 Talents Section */}
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

        {/* Organization Projects Section */}
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
                    {organizationProjects.map(project => (
                        <OrganizationProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </section>
        
        {/* Strongest Projects & Popular Skills Section */}
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
                        {strongestProjects.map(project => (
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
                        ))}
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
                        {popularSkills.map(skill => (
                            <Badge key={skill} variant="secondary" className="text-base px-4 py-2">{skill}</Badge>
                        ))}
                    </div>
                )}
            </div>
        </section>

        {/* Visual Statistics Section */}
        <section className="py-12">
           <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2">
                  <CategoryPieChart students={students || []} />
              </div>
              <div className="lg:col-span-3">
                  <FacultyBarChart students={students || []} faculties={faculties?.map(f => f.name) || []} />
              </div>
          </div>
        </section>
        
        {/* Success Stories Section */}
        <section className="py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Tələbə Uğur Hekayələri</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Platformamızın tələbələrimizin karyera yoluna necə təsir etdiyini kəşf edin.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {successStories.map(story => (
                    <SuccessStoryCard key={story.name} story={story} />
                ))}
            </div>
        </section>


        {/* New Members Section */}
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
    </div>
  );
}
