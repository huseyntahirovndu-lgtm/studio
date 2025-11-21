'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, FileSearch, Bookmark, Briefcase, Mail, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Organization, Student, Project, Invitation } from '@/types';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { StudentCard } from '@/components/student-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, documentId, updateDoc, getDoc, writeBatch } from 'firebase/firestore';


interface EnrichedInvitation extends Invitation {
    project?: Project;
    student?: Student;
}

export default function OrganizationDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const orgProfile = user as Organization;

    useEffect(() => {
        if (!loading && (!user || (user as Organization)?.role !== 'organization')) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    const savedStudentsQuery = useMemoFirebase(() => {
        if (!orgProfile?.savedStudentIds || orgProfile.savedStudentIds.length === 0) return null;
        return query(collection(firestore, 'users'), where(documentId(), 'in', orgProfile.savedStudentIds));
    }, [firestore, orgProfile?.savedStudentIds]);
    const { data: savedStudents, isLoading: savedStudentsLoading } = useCollection<Student>(savedStudentsQuery);

    const orgProjectsQuery = useMemoFirebase(() => {
        if (!orgProfile?.projectIds || orgProfile.projectIds.length === 0) return null;
        return query(collection(firestore, 'projects'), where(documentId(), 'in', orgProfile.projectIds));
    }, [firestore, orgProfile?.projectIds]);
    const { data: organizationProjects, isLoading: orgProjectsLoading } = useCollection<Project>(orgProjectsQuery);
    
    const applicationsQuery = useMemoFirebase(() => {
        if (!orgProfile) return null;
        const projectIds = orgProfile.projectIds || [];
        if (projectIds.length === 0) return null;
        return query(collection(firestore, `invitations`), where('projectId', 'in', projectIds), where('status', '==', 'müraciət'));
    }, [firestore, orgProfile?.id, orgProfile?.projectIds]);
    const { data: applications, isLoading: applicationsLoading } = useCollection<Invitation>(applicationsQuery as any);

    const [enrichedApplications, setEnrichedApplications] = useState<EnrichedInvitation[]>([]);

    useEffect(() => {
        if (applications) {
            const enrich = async () => {
                const enriched = await Promise.all(applications.map(async (app) => {
                    const studentDoc = await getDoc(doc(firestore, 'users', app.studentId));
                    const projectDoc = await getDoc(doc(firestore, 'projects', app.projectId));
                    return {
                        ...app,
                        student: studentDoc.exists() ? { id: studentDoc.id, ...studentDoc.data() } as Student : undefined,
                        project: projectDoc.exists() ? { id: projectDoc.id, ...projectDoc.data() } as Project : undefined,
                    }
                }));
                setEnrichedApplications(enriched.filter(e => e.student && e.project) as EnrichedInvitation[]);
            }
            enrich();
        }
    }, [applications, firestore]);
    
    const handleApplication = async (application: EnrichedInvitation, status: 'qəbul edildi' | 'rədd edildi') => {
        if(!application.student || !application.project || !orgProfile) return;
        
        const invitationDocRef = doc(firestore, `invitations`, application.id);
        const projectDocRef = doc(firestore, 'projects', application.projectId);

        try {
            const batch = writeBatch(firestore);

            batch.update(invitationDocRef, { status });

            if (status === 'qəbul edildi') {
                const updatedTeam = [...(application.project.teamMemberIds || []), application.student.id];
                batch.update(projectDocRef, { teamMemberIds: updatedTeam });
            }
            
            await batch.commit();

            setEnrichedApplications(prev => prev.filter(app => app.id !== application.id));

            toast({
                title: `Müraciət ${status === 'qəbul edildi' ? 'qəbul edildi' : 'rədd edildi'}`,
                description: `${application.student.firstName} adlı tələbənin "${application.project.title}" layihəsinə olan müraciəti ${status}.`
            });

        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Xəta",
                description: "Müraciət statusu yenilənərkən xəta baş verdi."
            });
            console.error(error);
        }
    };


    if (loading || !user || !orgProfile) {
        return <div className="container mx-auto py-8 text-center">Yüklənir...</div>;
    }
    
    const isLoading = savedStudentsLoading || orgProjectsLoading || applicationsLoading;

    return (
        <div className="container mx-auto py-8 md:py-12 px-4">
            <div className="mb-8 flex items-center gap-4">
                {orgProfile.logoUrl && <Avatar className="h-16 w-16"><AvatarImage src={orgProfile.logoUrl} /><AvatarFallback>{orgProfile.name.charAt(0)}</AvatarFallback></Avatar>}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">{orgProfile.name}</h1>
                    <p className="text-muted-foreground">Təşkilat Paneli</p>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <Mail /> Layihə Müraciətləri
                            </CardTitle>
                            <CardDescription>Layihələrinizə müraciət edən tələbələr.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {isLoading ? (
                                <p>Yüklənir...</p>
                            ) : enrichedApplications.length > 0 ? (
                               <div className="space-y-4">
                                    {enrichedApplications.map((app) => (
                                        <div key={app.id} className="border p-3 rounded-lg flex items-center justify-between gap-4">
                                            <Link href={`/profile/${app.student?.id}`} className="flex items-center gap-3 hover:underline">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={app.student?.profilePictureUrl} />
                                                    <AvatarFallback>{app.student?.firstName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{app.student?.firstName} {app.student?.lastName}</p>
                                                    <p className="text-sm text-muted-foreground">"{app.project?.title}" layihəsinə müraciət</p>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-600" onClick={() => handleApplication(app, 'qəbul edildi')}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => handleApplication(app, 'rədd edildi')}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                 <div className="text-center text-muted-foreground py-8">
                                    <p>Yeni müraciət yoxdur.</p>
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
                 <Card className="lg:col-span-1 h-fit">
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
                                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                         <p className="text-xs text-muted-foreground mt-2"><strong>Komanda:</strong> {project.teamMemberIds?.length || 0} üzv</p>
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
