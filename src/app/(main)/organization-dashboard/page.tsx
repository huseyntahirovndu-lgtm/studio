'use client';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, FileSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Organization, Student } from '@/types';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export default function OrganizationDashboard() {
    const { user, isUserLoading, profile } = useUser();
    const router = useRouter();
    
    useEffect(() => {
        if (!isUserLoading && (!user || (profile as Organization)?.role !== 'organization')) {
            router.push('/login');
        }
    }, [user, isUserLoading, profile, router]);

    const orgProfile = profile as Organization;

    if (isUserLoading || !user || !orgProfile) {
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
                    href="#"
                />
            </div>
             <div className="mt-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Yadda Saxlanılan Tələbələr</CardTitle>
                        <CardDescription>Bəyəndiyiniz və gələcək layihələr üçün nəzərdə tutduğunuz tələbələrin siyahısı.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-muted-foreground py-8">
                            <p>Hələ heç bir tələbə yadda saxlanılmayıb.</p>
                            <p className="text-sm mt-2">Axtarış səhifəsindən maraqlı profilləri yadda saxlaya bilərsiniz.</p>
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
