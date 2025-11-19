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
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, where, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Student } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const firestore = useFirestore();

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'student'));
  }, [firestore]);

  const topTalentsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'users'), where('role', '==', 'student'), limit(5));
  }, [firestore]);

  const newMembersQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'users'), where('role', '==', 'student'), limit(5));
  }, [firestore]);


  const { data: students, isLoading: isLoadingStudents } = useCollection<Student>(studentsQuery);
  const { data: topTalentsData, isLoading: isLoadingTopTalents } = useCollection<Student>(topTalentsQuery);
  const { data: newMembersData, isLoading: isLoadingNewMembers } = useCollection<Student>(newMembersQuery);
  
  const facultiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'faculties');
  }, [firestore]);
  
  const { data: faculties, isLoading: isLoadingFaculties } = useCollection(facultiesQuery);

  const enrichStudents = (studentsToEnrich: Student[] | null | undefined) => {
    return studentsToEnrich?.map((student, index) => {
        const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
        return {
          ...student,
          profilePictureUrl: placeholder.imageUrl,
          profilePictureHint: placeholder.imageHint,
        };
      }) || [];
  }

  const topTalents = enrichStudents(topTalentsData).sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0));
  const newMembers = enrichStudents(newMembersData).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));


  const totalAchievements = students?.reduce((acc, s) => acc + (s.achievementIds?.length || 0), 0) || 0;
  
  const isLoading = isLoadingStudents || isLoadingFaculties || isLoadingTopTalents || isLoadingNewMembers;

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
                    src="https://i.ibb.co/yFjxDz0w/q1.jpg"
                    alt="Naxçıvan Dövlət Universiteti"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl"
                    priority
                    data-ai-hint="university building"
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
