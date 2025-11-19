import Link from 'next/link';
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

export default function HomePage() {
  const topTalents = [...students]
    .sort((a, b) => b.talentScore - a.talentScore)
    .slice(0, 5);
  const newMembers = [...students]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);
  const totalAchievements = students.reduce((acc, s) => acc + s.achievements.length, 0);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-bold font-headline bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-4">
          İstedadları Kəşf Edin, Gələcəyi Qurun
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
          Naxçıvan Dövlət Universitetinin ən parlaq tələbələrini bir araya gətirən
          və onları karyera fürsətləri ilə buluşduran rəqəmsal platforma.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/search">
              İstedad Axtar <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">Platformaya Qoşul</Link>
          </Button>
        </div>
      </section>

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
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
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
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
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
  );
}
