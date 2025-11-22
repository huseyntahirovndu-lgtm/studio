'use client';
import {
  Activity,
  ArrowUpRight,
  Building,
  DollarSign,
  Users,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import { Student, Organization } from "@/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useMemo } from "react";

export default function AdminDashboard() {
  const firestore = useFirestore();

  const studentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "users"), where("role", "==", "student")) : null, [firestore]);
  const organizationsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "users"), where("role", "==", "organization")) : null, [firestore]);
  const recentStudentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "users"), where("role", "==", "student"), orderBy("createdAt", "desc"), limit(5)) : null, [firestore]);

  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
  const { data: organizations, isLoading: orgsLoading } = useCollection<Organization>(organizationsQuery);
  const { data: recentStudents, isLoading: recentStudentsLoading } = useCollection<Student>(recentStudentsQuery);

  const totalStudents = students?.length ?? 0;
  const totalOrganizations = organizations?.length ?? 0;
  
  const isLoading = studentsLoading || orgsLoading || recentStudentsLoading;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ümumi Tələbə
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Sistemdə qeydiyyatdan keçmiş tələbə sayı
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                 <Link href="/admin/organizations">Ümumi Təşkilat</Link>
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : totalOrganizations}</div>
              <p className="text-xs text-muted-foreground">
                Platformadakı partnyor təşkilat sayı
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Son Qeydiyyatlar</CardTitle>
                <CardDescription>
                  Sistemə yeni qoşulmuş tələbələr.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin/students">
                  Hamısına Bax
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tələbə</TableHead>
                    <TableHead className="hidden xl:table-column">
                      Fakültə
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Status
                    </TableHead>
                    <TableHead className="text-right">Qoşulma Tarixi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Yüklənir...</TableCell></TableRow>
                  ) : (
                    recentStudents?.map((student: Student) => (
                       <TableRow key={student.id}>
                          <TableCell>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {student.email}
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-column">
                            {student.faculty}
                          </TableCell>
                          <TableCell className="hidden xl:table-column">
                             <Badge variant={student.status === 'təsdiqlənmiş' ? 'default' : 'secondary'}>{student.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}</TableCell>
                     </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
