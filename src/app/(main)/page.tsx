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
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { Student } from '@/types';

export default function HomePage() {
  const firestore = useFirestore();

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: students, isLoading: isLoadingStudents } = useCollection<Student>(studentsQuery);
  
  const facultiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'faculties');
  }, [firestore]);
  
  const { data: faculties, isLoading: isLoadingFaculties } = useCollection(facultiesQuery);

  const topTalents = students
    ? [...students]
        .sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0))
        .slice(0, 5)
    : [];
  
  const newMembers = students
    ? [...students]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5)
    : [];

  const totalAchievements = students?.reduce((acc, s) => acc + (s.achievementIds?.length || 0), 0) || 0;
  
  if (isLoadingStudents || isLoadingFaculties) {
    return <div>Yüklənir...</div>
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full flex items-center">
        <Image
          src="https://i.ibb.co/yFjxDz0w/q1.jpg"
          alt="Naxçıvan Dövlət Universiteti"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
          priority
          data-ai-hint="university building"
        />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-8 lg:px-12">
            <div className="max-w-3xl text-left">
              
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
              value={students?.length.toString() ?? '0'}
              icon={Users}
            />
            <StatCard
              title="Aktiv Profillər"
              value={students?.length.toString() ?? '0'}
              icon={Users}
            />
            <StatCard
              title="Fakültə Sayı"
              value={faculties?.length.toString() ?? '0'}
              icon={Building}
            />
            <StatCard
              title="Ümumi Uğurlar"
              value={totalAchievements.toString()}
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
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {topTalents.map((student) => (
              <StudentCard key={student.id} student={student} />
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
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {newMembers.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
