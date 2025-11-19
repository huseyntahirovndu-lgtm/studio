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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { StudentCard } from '@/components/student-card';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { FacultyBarChart } from '@/components/charts/faculty-bar-chart';
import { Student, Project, Certificate } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudents, getProjects, getCertificates, faculties, getStudentById } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface EnrichedProject extends Project {
    student?: Student;
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

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [topTalents, setTopTalents] = useState<Student[]>([]);
  const [newMembers, setNewMembers] = useState<Student[]>([]);
  const [strongestProjects, setStrongestProjects] = useState<EnrichedProject[]>([]);
  const [popularSkills, setPopularSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const allStudents = getStudents();
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
    
    // Strongest Projects (from top 5 students)
    const allProjects = getProjects();
    const topStudentIds = sortedByTalent.slice(0,5).map(s => s.id);
    const projectsFromTopStudents: EnrichedProject[] = allProjects
        .filter(p => topStudentIds.includes(p.studentId))
        .map(p => ({
            ...p,
            student: getStudentById(p.studentId)
        }));
    setStrongestProjects(projectsFromTopStudents.slice(0, 3));
    
    // Popular skills
    const allSkills = enrichedStudents.flatMap(s => s.skills);
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
      <section className="relative w-full bg-primary/5">
         <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
            <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter">
                   Naxçıvan Dövlət Universiteti <span className="text-primary">İstedad Mərkəzi</span>
                </h1>
                <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-muted-foreground">
                    Tələbələrimizin bacarıqlarını, layihələrini və nailiyyətlərini kəşf edin. Potensialı reallığa çevirən platforma.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button asChild size="lg">
                        <Link href="/search">İstedadları Kəşf Et <ArrowRight className="ml-2" /></Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/register">Platformaya Qoşul</Link>
                    </Button>
                </div>
            </div>
             <div className="hidden lg:block relative">
                 <Image
                    src="https://i.ibb.co/cXv2KzRR/q2.jpg"
                    alt="Naxçıvan Dövlət Universiteti"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl"
                    priority
                    data-ai-hint="university campus students"
                    />
             </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Statistics Section */}
        <section className="py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Ümumi Tələbə Sayı"
              value={isLoading ? '...' : (students?.length.toString() ?? '0')}
              icon={Users}
            />
            <StatCard
              title="Aktiv Profillər"
              value={isLoading ? '...' : (students?.filter(s => s.status === 'təsdiqlənmiş').length.toString() ?? '0')}
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
        
        {/* Strongest Projects & Popular Skills Section */}
        <section className="py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">Ən Güclü Layihələr</h2>
                {isLoading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {strongestProjects.map(project => (
                            <Card key={project.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{project.title}</CardTitle>
                                    <CardDescription>
                                        <Link href={`/profile/${project.student?.id}`} className="hover:underline flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={project.student?.profilePictureUrl} />
                                                <AvatarFallback>{project.student?.firstName?.[0]}{project.student?.lastName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <span>{project.student?.firstName} {project.student?.lastName}</span>
                                        </Link>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                </CardContent>
                            </Card>
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
