'use client';
import { useParams } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Student, StudentOrganization, StudentOrgUpdate } from '@/types';
import { doc, collection, query, orderBy, where, documentId } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

function UpdateCard({ update }: { update: StudentOrgUpdate }) {
    const sanitizedContent = typeof window !== 'undefined' ? DOMPurify.sanitize(update.content) : update.content;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{update.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{update.createdAt ? format(update.createdAt.toDate(), 'dd MMMM, yyyy') : ''}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            </CardContent>
        </Card>
    );
}

export default function StudentOrganizationDetailsPage() {
    const { id } = useParams();
    const firestore = useFirestore();

    const orgId = typeof id === 'string' ? id : '';

    const orgDocRef = useMemoFirebase(() => orgId ? doc(firestore, 'student-organizations', orgId) : null, [firestore, orgId]);
    const { data: org, isLoading: orgLoading } = useDoc<StudentOrganization>(orgDocRef);
    
    const updatesQuery = useMemoFirebase(() => orgId ? query(collection(firestore, `student-organizations/${orgId}/updates`), orderBy('createdAt', 'desc')) : null, [firestore, orgId]);
    const { data: updates, isLoading: updatesLoading } = useCollection<StudentOrgUpdate>(updatesQuery);
    
    const membersQuery = useMemoFirebase(() => {
        if (!org?.memberIds || org.memberIds.length === 0) return null;
        return query(collection(firestore, 'users'), where(documentId(), 'in', org.memberIds));
    }, [firestore, org?.memberIds]);

    const { data: members, isLoading: membersLoading } = useCollection<Student>(membersQuery as any);

    const leaderDocRef = useMemoFirebase(() => org?.leaderId ? doc(firestore, 'users', org.leaderId) : null, [firestore, org?.leaderId]);
    const { data: leader, isLoading: leaderLoading } = useDoc<Student>(leaderDocRef);
    
    const isLoading = orgLoading || updatesLoading || membersLoading || leaderLoading;

    if (isLoading) {
        return (
            <>
            <main className='flex-1'>
            <div className="container mx-auto py-8 md:py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
            </main>
            </>
        );
    }
    
    if (!org) {
        return (
            <>
            <main className='flex-1'>
            <div className="text-center py-16">Tələbə təşkilatı tapılmadı.</div>
            </main>
            </>
        )
    }

    return (
        <>
        <main className='flex-1'>
        <div className="container mx-auto py-8 md:py-12 px-4">
            <Card className="mb-8 overflow-hidden">
                <div className="relative h-48 bg-muted">
                    {/* Placeholder for a cover image */}
                </div>
                 <CardHeader className="flex flex-col sm:flex-row items-center gap-6 -mt-20 px-6 sm:px-8">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                        <AvatarImage src={org.logoUrl} alt={org.name} />
                        <AvatarFallback className="text-4xl">{org.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold">{org.name}</h1>
                        <p className="text-muted-foreground">{org.faculty}</p>
                    </div>
                </CardHeader>
                <CardContent className="px-6 sm:px-8 pb-6">
                     <p className="max-w-3xl">{org.description}</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Rəhbər</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {leader && (
                                <div className="flex items-center gap-4">
                                     <Avatar>
                                        <AvatarImage src={leader.profilePictureUrl} alt={leader.firstName} />
                                        <AvatarFallback>{leader.firstName?.[0]}{leader.lastName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{leader.firstName} {leader.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{leader.major}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Üzvlər ({members?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {members && members.map(member => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={member.profilePictureUrl} alt={member.firstName} />
                                        <AvatarFallback>{member.firstName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{member.major}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Son Yeniliklər</h2>
                        {updates && updates.length > 0 ? (
                            <div className="space-y-6">
                                {updates.map(update => <UpdateCard key={update.id} update={update} />)}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-16 border rounded-lg">
                                <p>Bu təşkilatdan hələ heç bir yenilik paylaşılmayıb.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </main>
        </>
    );
}
