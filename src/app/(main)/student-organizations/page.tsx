'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { StudentOrganization } from '@/types';
import { collection } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function StudentOrganizationCard({ org }: { org: StudentOrganization }) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
             <Link href={`/student-organizations/${org.id}`}>
                <CardHeader className="flex-row gap-4 items-center">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={org.logoUrl} alt={org.name} />
                        <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription>{org.faculty}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {org.description}
                    </p>
                     <p className="text-xs text-muted-foreground mt-4">
                        {org.memberIds?.length || 0} üzv
                    </p>
                </CardContent>
            </Link>
        </Card>
    );
}


export default function StudentOrganizationsPage() {
    const firestore = useFirestore();
    const studentOrgsQuery = useMemoFirebase(() => collection(firestore, 'student-organizations'), [firestore]);
    const { data: studentOrgs, isLoading } = useCollection<StudentOrganization>(studentOrgsQuery);

    return (
        <div className="container mx-auto py-8 md:py-12 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Tələbə Təşkilatları</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Naxçıvan Dövlət Universitetində fəaliyyət göstərən tələbə təşkilatları ilə tanış olun, onlara qoşulun və tələbəlik həyatınızı daha maraqlı edin.
                </p>
            </div>

            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex-row gap-4 items-center">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full mt-2" />
                                <Skeleton className="h-4 w-2/3 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentOrgs && studentOrgs.length > 0 ? (
                        studentOrgs.map(org => <StudentOrganizationCard key={org.id} org={org} />)
                    ) : (
                        <p className="col-span-full text-center text-muted-foreground py-16">
                            Heç bir tələbə təşkilatı tapılmadı.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
