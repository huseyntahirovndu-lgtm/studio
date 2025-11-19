'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Users,
  Building,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { StudentCard } from '@/components/student-card';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { FacultyBarChart } from '@/components/charts/faculty-bar-chart';
import { Student } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudents, faculties } from '@/lib/data';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [topTalents, setTopTalents] = useState<Student[]>([]);
  const [newMembers, setNewMembers] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    const sortedByTalent = [...enrichedStudents].sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0));
    setTopTalents(sortedByTalent.slice(0, 5));

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


        {/* Top 5 Talents Section */}
        <section className="py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Top 5 İstedad
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/rankings">
                Bütün reytinqlərə bax <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
           {isLoading ? (
             <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
             </div>
           ) : (
             <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {topTalents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
           )}
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
