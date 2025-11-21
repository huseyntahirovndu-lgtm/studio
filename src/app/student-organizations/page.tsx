'use client';
import { StudentOrganization } from '@/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function AllStudentOrganizationsPage() {
    const firestore = useFirestore();
    const studentOrgsQuery = useMemoFirebase(() => query(collection(firestore, 'student-organizations'), orderBy("name", "asc")), [firestore]);
    const { data: studentOrgs, isLoading } = useCollection<StudentOrganization>(studentOrgsQuery);

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold">Tələbə Təşkilatları</h1>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Naxçıvan Dövlət Universitetinin aktiv və dinamik tələbə təşkilatları ilə tanış olun, onların fəaliyyətlərini kəşf edin və sizə uyğun olan birinə qoşulun.</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                           <div className="w-20 h-20 bg-muted rounded-full animate-pulse"></div>
                           <div className="space-y-2 flex-1">
                               <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
                               <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                           </div>
                        </div>
                    ))}
                </div>
            ) : studentOrgs && studentOrgs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {studentOrgs.map(org => (
                        <Card key={org.id} className="hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                           <Link href={`/student-organizations/${org.id}`} className="flex flex-col h-full">
                              <CardHeader className="flex-row gap-4 items-center">
                                  <Avatar className="w-20 h-20">
                                      <AvatarImage src={org.logoUrl} alt={org.name} />
                                      <AvatarFallback className="text-2xl">{org.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <CardTitle>{org.name}</CardTitle>
                                      <CardDescription>{org.faculty}</CardDescription>
                                  </div>
                              </CardHeader>
                              <CardContent className="flex-grow">
                                  <p className="text-sm text-muted-foreground line-clamp-3">{org.description}</p>
                              </CardContent>
                          </Link>
                      </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center col-span-full text-muted-foreground py-16">
                    <h2 className="text-2xl font-semibold mb-2">Heç bir tələbə təşkilatı tapılmadı.</h2>
                    <p>Tezliklə yeni təşkilatlar burada olacaq.</p>
                </div>
            )}
        </div>
    );
}
