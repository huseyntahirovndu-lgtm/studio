'use client';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { StudentOrganization, Student } from '@/types';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { collection, query, where, documentId } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  const memberJoinData = useMemo(() => {
    if (!members) return [];
    const monthlyData: { [key: string]: number } = {};
    members.forEach(member => {
        let memberDate;
        if (member.createdAt && typeof member.createdAt.toDate === 'function') {
            memberDate = member.createdAt.toDate();
        } else if (member.createdAt && typeof member.createdAt === 'string') {
            memberDate = new Date(member.createdAt);
        } else if (member.createdAt) {
            memberDate = member.createdAt; // Assume it's already a Date object
        }

        if (memberDate instanceof Date && !isNaN(memberDate.getTime())) {
            const month = memberDate.toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
    });
    return Object.keys(monthlyData).map(month => ({ month, members: monthlyData[month] }));
  }, [members]);

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
    </div>
  );
}
