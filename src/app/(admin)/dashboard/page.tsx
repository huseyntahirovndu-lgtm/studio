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
import { getStudents, getOrganizations } from "@/lib/data";

export default function AdminDashboard() {
  const students = getStudents();
  const organizations = getOrganizations();
  const totalStudents = students.length;
  const totalOrganizations = organizations.length;
  const recentStudents = students.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ümumi Tələbə
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
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
              <div className="text-2xl font-bold">{totalOrganizations}</div>
              <p className="text-xs text-muted-foreground">
                Platformadakı partnyor təşkilat sayı
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktivlik</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                Son 1 ayda profil yeniləmələri
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
                  {recentStudents.map((student) => (
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
                        <TableCell className="text-right">{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                   </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
