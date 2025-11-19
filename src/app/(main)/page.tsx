'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BarChart,
  PieChart,
  Users,
  Trophy,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { StudentCard } from '@/components/student-card';
import { students, faculties } from '@/lib/data';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { FacultyBarChart } from '@/components/charts/faculty-bar-chart';
import { Logo } from '@/components/logo';

export default function HomePage() {
  const topTalents = [...students]
    .sort((a, b) => b.talentScore - a.talentScore)
    .slice(0, 5);
  const newMembers = [...students]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);
  const totalAchievements = students.reduce((acc, s) => acc + s.achievements.length, 0);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full flex items-center">
        <Image
          src="https://i.ibb.co/cXv2KzRR/q2.jpg"
          alt="Naxçıvan Dövlət Universiteti"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
          priority
          data-ai-hint="university building"
        />
        
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="container mx-auto px-4 md:px-8 lg:px-12">
            <div className="max-w-3xl text-left">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-white">
                Naxçıvan Dövlət Universiteti <br /> Tələbə İstedad Bankı
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white">
                İstedadını göstərəcək platforma.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/search">
                    Kəşf et <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
                  asChild
                >
                  <Link href="/register">Qeydiyyat</Link>
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
              value={students.length.toString()}
              icon={Users}
            />
            <StatCard
              title="Aktiv Profillər"
              value={students.length.toString()}
              icon={Users}
            />
            <StatCard
              title="Fakültə Sayı"
              value={faculties.length.toString()}
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
                  <CategoryPieChart />
              </div>
              <div className="lg:col-span-3">
                  <FacultyBarChart />
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
