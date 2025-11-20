'use client';
import React, { useState, useMemo, useEffect } from "react";
import { File, ListFilter, MoreHorizontal } from "lucide-react"
import Link from "next/link";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { faculties, deleteUser, updateUser, getStudents } from "@/lib/data";
import type { Student, StudentStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setStudents(getStudents());
  }, [])

  const handleStatusChange = (student: Student, newStatus: StudentStatus) => {
    const updatedStudent = { ...student, status: newStatus };
    const success = updateUser(updatedStudent);
    if(success) {
        setStudents(prev => prev.map(s => s.id === student.id ? updatedStudent : s));
        toast({ title: "Status uğurla dəyişdirildi."});
    } else {
        toast({ variant: 'destructive', title: "Xəta", description: "Status dəyişdirilərkən xəta baş verdi."});
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    const success = deleteUser(studentId);
     if(success) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        toast({ title: "Tələbə uğurla silindi."});
    } else {
        toast({ variant: 'destructive', title: "Xəta", description: "Tələbə silinərkən xəta baş verdi."});
    }
  }
  
    const statusMap: Record<StudentStatus, string> = {
        'təsdiqlənmiş': 'Təsdiqlənmiş',
        'gözləyir': 'Gözləyir',
        'arxivlənmiş': 'Arxivlənmiş'
    };

    return (
        <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">Hamısı</TabsTrigger>
                <TabsTrigger value="təsdiqlənmiş">Təsdiqlənmiş</TabsTrigger>
                <TabsTrigger value="gözləyir">Gözləyən</TabsTrigger>
                <TabsTrigger value="arxivlənmiş" className="hidden sm:flex">
                  Arxivlənmiş
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtr
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Fakültəyə görə</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {faculties.map(faculty => (
                       <DropdownMenuCheckboxItem key={faculty.id}>
                        {faculty.name}
                       </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-7 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-srely sm:whitespace-nowrap">
                    Eksport
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
               <Card>
                <CardHeader>
                  <CardTitle>Tələbələr</CardTitle>
                  <CardDescription>
                    Sistemdəki bütün tələbələri idarə edin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          İstedad Balı
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Qeydiyyat Tarixi
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Əməliyyatlar</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                     {students.map((student) => (
                        <TableRow key={student.id}>
                            <TableCell className="font-medium">
                                {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>
                                <Badge variant={student.status === 'təsdiqlənmiş' ? 'default' : student.status === 'gözləyir' ? 'secondary' : 'outline'}>
                                  {statusMap[student.status]}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {student.talentScore}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Date(student.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                    >
                                     <MoreHorizontal className="h-4 w-4" />
                                     <span className="sr-only">Menyunu aç</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/profile/${student.id}`}>Profilə bax</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profile/edit?userId=${student.id}`}>Redaktə et</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>Statusu dəyiş</DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onClick={() => handleStatusChange(student, 'təsdiqlənmiş')}>Təsdiqlə</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(student, 'gözləyir')}>Gözləməyə al</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(student, 'arxivlənmiş')}>Arxivlə</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Sil</DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Təsdiq edirsiniz?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Bu əməliyyat geri qaytarılmazdır. Bu, tələbəni sistemdən həmişəlik siləcək.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteStudent(student.id)} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                     ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Göstərilir: <strong>1-10</strong> / <strong>{students.length}</strong>{" "}
                    tələbə
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
    )
}
