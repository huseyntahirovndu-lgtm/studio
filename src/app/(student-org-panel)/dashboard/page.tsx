'use client';
import { useAuth, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { StudentOrganization, Student } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, doc, query, where, documentId, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Combobox } from '@/components/ui/combobox';
import { PlusCircle, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  members: {
    label: 'Yeni Üzvlər',
    color: 'hsl(var(--chart-1))',
  },
};

export default function OrganizationDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const ledOrgQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'telebe-teskilatlari'), where('leaderId', '==', user.id), where('status', '==', 'təsdiqlənmiş')) : null),
    [firestore, user]
  );
  const { data: ledOrgs, isLoading: ledOrgsLoading } = useCollection<StudentOrganization>(ledOrgQuery);
  const organization = ledOrgs?.[0];

  const membersQuery = useMemoFirebase(
    () => (organization?.memberIds && organization.memberIds.length > 0 ? query(collection(firestore, 'users'), where(documentId(), 'in', organization.memberIds)) : null),
    [firestore, organization]
  );
  const { data: members, isLoading: membersLoading } = useCollection<Student>(membersQuery);

  const allStudentsQuery = useMemoFirebase(() => query(collection(firestore, 'users'), where('role', '==', 'student')), [firestore]);
  const { data: allStudents } = useCollection<Student>(allStudentsQuery);
  
  const memberJoinData = useMemo(() => {
    if (!members) return [];
    const monthlyData: { [key: string]: number } = {};
    members.forEach(member => {
        if(member.createdAt) {
            const month = new Date(member.createdAt).toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
    });
    return Object.keys(monthlyData).map(month => ({ month, members: monthlyData[month] }));
  }, [members]);

  const studentOptions =
    allStudents?.filter(s => !organization?.memberIds?.includes(s.id) && s.id !== organization?.leaderId).map(s => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName} (${s.faculty})`,
      })) || [];

  const handleAddMember = async () => {
    if (!organization || !selectedStudentId) return;
    setIsAddingMember(true);
    const orgDocRef = doc(firestore, 'telebe-teskilatlari', organization.id);
    const newMemberIds = [...(organization.memberIds || []), selectedStudentId];

    await updateDoc(orgDocRef, { memberIds: newMemberIds });
    toast({ title: 'Uğurlu', description: 'Təşkilata yeni üzv əlavə edildi.' });
    setSelectedStudentId('');
    setIsAddingMember(false);
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if(!organization) return;
    const orgDocRef = doc(firestore, 'telebe-teskilatlari', organization.id);
    const newMemberIds = organization.memberIds.filter(id => id !== memberId);
    
    await updateDoc(orgDocRef, { memberIds: newMemberIds });
    toast({ title: 'Uğurlu', description: 'Üzv təşkilatdan çıxarıldı.' });
  }

  if (loading || ledOrgsLoading) {
    return <div className="flex h-screen items-center justify-center">Yüklənir...</div>;
  }
  
  if(!organization) {
    return <div className="flex h-screen items-center justify-center">Təşkilat tapılmadı və ya təsdiqlənməyib.</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={organization.logoUrl} alt={organization.name} />
            <AvatarFallback>{organization.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{organization.name}</CardTitle>
            <CardDescription>{organization.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                    <p className="text-3xl font-bold">{organization.memberIds?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Üzv Sayı</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted col-span-1 md:col-span-3">
                     <p className="text-lg font-bold mb-2">Aylara görə yeni üzvlər</p>
                    <ChartContainer config={chartConfig} className="min-h-[100px] w-full">
                        <BarChart accessibilityLayer data={memberJoinData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="members" fill="var(--color-members)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users /> Təşkilat Üzvləri</CardTitle>
          <CardDescription>Təşkilatınızın üzvlərini idarə edin.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2 mb-4">
                <Combobox
                    options={studentOptions}
                    value={selectedStudentId}
                    onChange={setSelectedStudentId}
                    placeholder="Üzv əlavə et..."
                    searchPlaceholder="Tələbə axtar..."
                    notFoundText="Tələbə tapılmadı."
                />
                <Button onClick={handleAddMember} disabled={!selectedStudentId || isAddingMember}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isAddingMember ? 'Əlavə edilir...' : 'Əlavə Et'}
                </Button>
            </div>
            
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>Fakültə</TableHead>
                            <TableHead className="text-right">Əməliyyat</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {membersLoading ? (
                            <TableRow><TableCell colSpan={3} className="text-center">Yüklənir...</TableCell></TableRow>
                        ) : members && members.length > 0 ? (
                           members.map(member => (
                               <TableRow key={member.id}>
                                   <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                                   <TableCell>{member.faculty}</TableCell>
                                   <TableCell className="text-right">
                                       <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                                           <Trash2 className="h-4 w-4 text-destructive"/>
                                       </Button>
                                   </TableCell>
                               </TableRow>
                           ))
                        ) : (
                             <TableRow><TableCell colSpan={3} className="text-center">Heç bir üzv tapılmadı.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
