'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, FileSearch, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Organization, Student } from '@/types';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { StudentCard } from '@/components/student-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getStudentById } from '@/lib/data';

export default function OrganizationDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [savedStudents, setSavedStudents] = useState<Student[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(true);

    const orgProfile = user as Organization;

    useEffect(() => {
        if (!loading && (!user || (user as Organization)?.role !== 'organization')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
      if (orgProfile?.savedStudentIds) {
        setIsLoadingStudents(true);
        const studentPromises = orgProfile.savedStudentIds.map(id => getStudentById(id));
        Promise.all(studentPromises).then(results => {
          const students = results.filter((s): s is Student => s !== undefined);
          const enrichedStudents = students.map((student, index) => {
            const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
            return {
              ...student,
              profilePictureUrl: placeholder.imageUrl,
              profilePictureHint: placeholder.imageHint,
            };
          });
          setSavedStudents(enrichedStudents);
          setIsLoadingStudents(false);
        });
      } else {
        setIsLoadingStudents(false);
      }
    }, [orgProfile]);


    if (loading || !user || !orgProfile) {
        return <div className="container mx-auto py-8 text-center">Yüklənir...</div>;
    }

    return (
        <div className="container mx-auto py-8 md:py-12 px-4">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Təşkilat Paneli</h1>
                <p className="text-muted-foreground">Xoş gəlmisiniz, {orgProfile.name}!</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <DashboardActionCard
                    title="İstedadları Kəşf Et"
                    description="Platformadakı tələbələr arasında axtarış edin və filtrləyin."
                    icon={Users}
                    href="/search"
                />
                <DashboardActionCard
                    title="Reytinqlərə Bax"
                    description="Ən yüksək bal toplayan tələbələrin sıralamasını izləyin."
                    icon={FileSearch}
                    href="/rankings"
                />
                 <DashboardActionCard
                    title="Profilim"
                    description="Təşkilat profilinizi nəzərdən keçirin və redaktə edin."
                    icon={Building}
                    href="/organization-profile/edit"
                />
            </div>
             <div className="mt-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Bookmark /> Yadda Saxlanılan Tələbələr
                        </CardTitle>
                        <CardDescription>Bəyəndiyiniz və gələcək layihələr üçün nəzərdə tutduğunuz tələbələrin siyahısı.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingStudents ? (
                            <p>Yüklənir...</p>
                        ) : savedStudents && savedStudents.length > 0 ? (
                           <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {savedStudents.map((student) => (
                                    <StudentCard key={student.id} student={student} />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center text-muted-foreground py-8">
                                <p>Hələ heç bir tələbə yadda saxlanılmayıb.</p>
                                <p className="text-sm mt-2">Axtarış səhifəsindən maraqlı profilləri yadda saxlaya bilərsiniz.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

interface DashboardActionCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
}

function DashboardActionCard({ title, description, icon: Icon, href }: DashboardActionCardProps) {
    return (
        <Link href={href}>
            <Card className="h-full hover:bg-accent/50 hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription className="mt-1 text-xs">{description}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}
