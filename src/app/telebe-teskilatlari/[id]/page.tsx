'use client';
import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { StudentOrganization, StudentOrgUpdate, Student } from '@/types';
import { doc, collection, query, where, orderBy, documentId } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { Users, User, Calendar, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DOMPurify from 'dompurify';
import Link from 'next/link';

export default function StudentOrganizationDetailsPage() {
    const { id } = useParams();
    const firestore = useFirestore();

    const orgId = typeof id === 'string' ? id : '';

    const orgDocRef = useMemoFirebase(() => orgId ? doc(firestore, 'telebe-teskilatlari', orgId) : null, [firestore, orgId]);
    const { data: org, isLoading: orgLoading } = useDoc<StudentOrganization>(orgDocRef);

    const updatesQuery = useMemoFirebase(() => orgId ? query(collection(firestore, `telebe-teskilatlari/${orgId}/updates`), orderBy('createdAt', 'desc')) : null, [firestore, orgId]);
    const { data: updates, isLoading: updatesLoading } = useCollection<StudentOrgUpdate>(updatesQuery);

    const membersQuery = useMemoFirebase(() => {
        if (!org?.memberIds || org.memberIds.length === 0) return null;
        // Firestore 'in' queries are limited to 30 elements. If you expect more members, you'll need pagination.
        const memberIdsToQuery = org.memberIds.slice(0, 30);
        return query(collection(firestore, 'users'), where(documentId(), 'in', memberIdsToQuery));
    }, [firestore, org?.memberIds]);
    const { data: members, isLoading: membersLoading } = useCollection<Student>(membersQuery as any);

    const leaderQuery = useMemoFirebase(() => org?.leaderId ? query(collection(firestore, 'users'), where('id', '==', org.leaderId)) : null, [firestore, org?.leaderId]);
    const { data: leaderArr, isLoading: leaderLoading } = useCollection<Student>(leaderQuery as any);
    const leader = leaderArr?.[0];

    const isLoading = orgLoading || updatesLoading || membersLoading || leaderLoading;

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-6xl py-12 px-4 space-y-8">
                <Skeleton className="h-48 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!org) {
        return <div className="text-center py-20">Tələbə təşkilatı tapılmadı.</div>;
    }

    return (
        <div className="bg-muted/40">
            <header className="relative h-[40vh] bg-background">
                <div className="absolute inset-0">
                    <Image 
                        src={org.logoUrl || `https://picsum.photos/seed/${org.id}/1200/400`} 
                        alt={`${org.name} cover`} 
                        fill
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
                <div className="relative container mx-auto h-full flex flex-col justify-end pb-12 px-4">
                     <div className="flex items-end gap-6">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-lg -mb-8">
                            <AvatarImage src={org.logoUrl} alt={org.name} />
                            <AvatarFallback className="text-4xl">{org.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                                {org.name}
                            </h1>
                            <p className="text-lg text-muted-foreground mt-1">{org.faculty}</p>
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="container mx-auto max-w-6xl py-12 px-4 mt-8">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <main className="lg:col-span-2 space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>Təşkilat Haqqında</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{org.description}</p>
                            </CardContent>
                        </Card>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Son Yeniliklər</h2>
                             <div className="space-y-6">
                                {updates && updates.length > 0 ? updates.map(update => {
                                    const sanitizedContent = typeof window !== 'undefined' 
                                        ? DOMPurify.sanitize(update.content) 
                                        : update.content;
                                    return (
                                        <Card key={update.id}>
                                            <CardHeader>
                                                <CardTitle>{update.title}</CardTitle>
                                                <CardDescription>
                                                    {update.createdAt ? format(update.createdAt.toDate(), 'dd MMMM, yyyy') : ''}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div 
                                                    className="prose dark:prose-invert max-w-none text-sm" 
                                                    dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
                                                />
                                            </CardContent>
                                        </Card>
                                    )
                                }) : (
                                    <p className="text-muted-foreground">Heç bir yenilik tapılmadı.</p>
                                )}
                            </div>
                        </section>
                    </main>
                    <aside className="space-y-6 sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Award /> Rəhbərlik</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {leader && (
                                     <Link href={`/profile/${leader.id}`} className="flex items-center gap-3 group">
                                        <Avatar>
                                            <AvatarImage src={leader.profilePictureUrl} />
                                            <AvatarFallback>{leader.firstName.charAt(0)}{leader.lastName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold group-hover:underline">{leader.firstName} {leader.lastName}</p>
                                            <p className="text-sm text-muted-foreground">Təşkilat Rəhbəri</p>
                                        </div>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users /> Üzvlər</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                 {members && members.length > 0 ? members.map(member => (
                                     <Link key={member.id} href={`/profile/${member.id}`} className="flex items-center gap-3 group">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.profilePictureUrl} />
                                            <AvatarFallback>{member.firstName.charAt(0)}{member.lastName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p className="font-medium text-sm group-hover:underline">{member.firstName} {member.lastName}</p>
                                    </Link>
                                 )) : (
                                     <p className="text-sm text-muted-foreground">Üzv yoxdur.</p>
                                 )}
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}
