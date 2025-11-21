'use client';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { StudentOrganization } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminStudentOrganizationsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const studentOrgsQuery = useMemoFirebase(() => query(collection(firestore, "student-organizations"), orderBy("name", "asc")), [firestore]);
    const { data: studentOrgs, isLoading } = useCollection<StudentOrganization>(studentOrgsQuery);

    const handleDelete = (orgId: string) => {
        const orgDocRef = doc(firestore, 'student-organizations', orgId);
        deleteDocumentNonBlocking(orgDocRef);
        toast({ title: "Tələbə təşkilatı uğurla silindi." });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Tələbə Təşkilatları</CardTitle>
                        <CardDescription>
                            Universitetdəki tələbə təşkilatlarını idarə edin.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/student-organizations/add">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Yeni Təşkilat Yarat
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Təşkilat</TableHead>
                    <TableHead className="hidden md:table-cell">Fakültə</TableHead>
                    <TableHead className="hidden md:table-cell">Üzv Sayı</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                         <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">Yüklənir...</TableCell>
                        </TableRow>
                    ) : studentOrgs && studentOrgs.length > 0 ? (
                        studentOrgs.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={item.logoUrl} />
                                    <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {item.name}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{item.faculty}</TableCell>
                            <TableCell className="hidden md:table-cell">
                               {item.memberIds?.length || 0}
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Menyunu aç</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/telebe-teskilatlari/${item.id}`} target="_blank">Təşkilata Bax</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/student-organizations/edit/${item.id}`}>Redaktə Et</Link>
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Sil</DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Silməni təsdiq edirsiniz?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bu əməliyyat geri qaytarılmazdır. "{item.name}" adlı təşkilat sistemdən həmişəlik silinəcək.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">Heç bir tələbə təşkilatı tapılmadı.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
