'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, FileSearch, Bookmark, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Organization, Student, Project } from '@/types';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { StudentCard } from '@/components/student-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getStudentById, getProjectsByIds } from '@/lib/data';

export default function OrganizationDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [savedStudents, setSavedStudents] = useState<Student[]>([]);
    const [organizationProjects, setOrganizationProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const orgProfile = user as Organization;

    useEffect(() => {
        if (!loading && (!user || (user as Organization)?.role !== 'organization')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
      if (orgProfile) {
        setIsLoading(true);
        const studentPromises = (orgProfile.savedStudentIds || []).map(id => getStudentById(id));
        const projectPromises = getProjectsByIds(orgProfile.projectIds || []);

        Promise.all([Promise.all(studentPromises), projectPromises]).then(([studentResults, projectResults]) => {
          const students = studentResults.filter((s): s is Student => s !== undefined);
          const enrichedStudents = students.map((student, index) => {
            const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
            return {
              ...student,
              profilePictureUrl: placeholder.imageUrl,
              profilePictureHint: placeholder.imageHint,
            };
          });
          setSavedStudents(enrichedStudents);
          setOrganizationProjects(projectResults);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
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
            
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Briefcase /> Layihələrim
                        </CardTitle>
                        <CardDescription>Təşkilatınızın aktiv və tamamlanmış layihələri.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {isLoading ? (
                            <p>Yüklənir...</p>
                        ) : organizationProjects && organizationProjects.length > 0 ? (
                           <div className="space-y-4">
                                {organizationProjects.map((project) => (
                                    <div key={project.id} className="border p-4 rounded-lg">
                                        <h4 className="font-semibold">{project.title}</h4>
                                        <p className="text-sm text-muted-foreground">{project.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center text-muted-foreground py-8">
                                <p>Hələ heç bir layihə yaradılmayıb.</p>
                                <p className="text-sm mt-2">Profil redaktə səhifəsindən yeni layihələr əlavə edə bilərsiniz.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Bookmark /> Yadda Saxlanılan Tələbələr
                        </CardTitle>
                        <CardDescription>Bəyəndiyiniz və gələcək layihələr üçün nəzərdə tutduğunuz tələbələrin siyahısı.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p>Yüklənir...</p>
                        ) : savedStudents && savedStudents.length > 0 ? (
                           <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2">
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
