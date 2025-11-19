'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ClipboardList, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Student } from '@/types';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';


export default function StudentDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (!loading && (!user || (user as Student)?.role !== 'student')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const studentProfile = user as Student;

    const profileCompletion = useMemo(() => {
        if (!studentProfile) return 0;
        
        const fields = [
            { value: studentProfile.firstName, weight: 1 },
            { value: studentProfile.lastName, weight: 1 },
            { value: studentProfile.major, weight: 1 },
            { value: studentProfile.educationForm, weight: 1 },
            { value: studentProfile.gpa, weight: 1 },
            { value: studentProfile.skills && studentProfile.skills.length > 1, weight: 2 }, 
            { value: studentProfile.projectIds && studentProfile.projectIds.length > 0, weight: 2 },
            { value: studentProfile.achievementIds && studentProfile.achievementIds.length > 0, weight: 2 },
            { value: studentProfile.certificateIds && studentProfile.certificateIds.length > 0, weight: 2 },
            { value: studentProfile.linkedInURL, weight: 1 },
            { value: studentProfile.githubURL, weight: 1 },
            { value: studentProfile.portfolioURL, weight: 1 },
        ];

        const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
        const completedWeight = fields.reduce((sum, field) => {
            if (field.value) {
                return sum + field.weight;
            }
            return sum;
        }, 0);
        
        if (totalWeight === 0) return 0;
        return Math.round((completedWeight / totalWeight) * 100);
    }, [studentProfile]);


    if (loading || !user || !studentProfile) {
        return <div className="container mx-auto py-8 text-center">Yüklənir...</div>;
    }

    return (
        <div className="container mx-auto py-8 md:py-12 px-4">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Tələbə Paneli</h1>
                <p className="text-muted-foreground">Xoş gəlmisiniz, {studentProfile.firstName}!</p>
            </div>

             <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Profilin Tamlığı</CardTitle>
                    <CardDescription>Profilinizi tamamlamaq daha çox diqqət çəkməyinizə kömək edər.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Progress value={profileCompletion} className="w-full" />
                        <span className="font-bold text-lg">{profileCompletion}%</span>
                    </div>
                     {profileCompletion < 100 && (
                        <div className="text-sm text-muted-foreground mt-2">
                            Profilinizi daha da gücləndirmək üçün <Link href="/profile/edit" className="text-primary hover:underline">layihə, nailiyyət və sertifikatlarınızı</Link> əlavə edin.
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <DashboardActionCard
                    title="Profilimi İdarə Et"
                    description="Şəxsi məlumatları, layihələri və nailiyyətləri yeniləyin."
                    icon={Edit}
                    href={`/profile/edit`} 
                />
                <DashboardActionCard
                    title="İctimai Profilim"
                    description="Profilinizin digər istifadəçilər tərəfindən necə göründüyünə baxın."
                    icon={User}
                    href={`/profile/${user.id}`}
                />
                 <DashboardActionCard
                    title="Reytinqlərə Bax"
                    description="Platformadakı ümumi sıralamanızı və digər tələbələri izləyin."
                    icon={ClipboardList}
                    href="/rankings"
                />
            </div>
             <div className="mt-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Mənim Statistikam</CardTitle>
                        <CardDescription>Platformadakı fəaliyyətinizə ümumi baxış.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-muted">
                            <p className="text-3xl font-bold">{studentProfile.talentScore || 0}</p>
                            <p className="text-sm text-muted-foreground">İstedad Balı</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                            <p className="text-3xl font-bold">{studentProfile.projectIds?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Layihə Sayı</p>
                        </div>
                         <div className="p-4 rounded-lg bg-muted">
                            <p className="text-3xl font-bold">{studentProfile.achievementIds?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Nailiyyət Sayı</p>
                        </div>
                         <div className="p-4 rounded-lg bg-muted">
                            <p className="text-3xl font-bold">{studentProfile.certificateIds?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Sertifikat Sayı</p>
                        </div>
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
