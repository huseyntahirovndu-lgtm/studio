'use client';
import {
  MoreHorizontal,
  PlusCircle,
} from "lucide-react"
import Link from "next/link";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Organization } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, useAuth } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";

export default function AdminOrganizationsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: adminUser, loading: adminLoading } = useAuth();

    const organizationsQuery = useMemoFirebase(() => (firestore && adminUser?.role === 'admin') ? query(collection(firestore, "users"), where("role", "==", "organization")) : null, [firestore, adminUser]);
    const { data: organizations, isLoading } = useCollection<Organization>(organizationsQuery);

    const handleDelete = (orgId: string) => {
        // Note: This only deletes the user document. The actual user account in Firebase Auth needs to be deleted separately if required.
        // For simplicity, we are just deleting the DB record here.
        const orgDocRef = doc(firestore, 'users', orgId);
        deleteDocumentNonBlocking(orgDocRef);
        toast({ title: "Təşkilat uğurla silindi." });
    };

    if (adminLoading || isLoading) {
      return <div className="text-center py-10">Yüklənir...</div>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Təşkilatlar</CardTitle>
                        <CardDescription>
                            Platformadakı partnyor təşkilatları idarə edin.
                        </CardDescription>
                    </div>
                     <Button asChild>
                        <Link href="/admin/organizations/add">
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
                    <TableHead>Təşkilat Adı</TableHead>
                    <TableHead className="hidden md:table-cell">
                        Sektor
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                        Qoşulma Tarixi
                    </TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {isLoading ? (
                         <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">Yüklənir...</TableCell>
                        </TableRow>
                    ) : organizations && organizations.length > 0 ? (
                        organizations.map((org) => (
                        <TableRow key={org.id}>
                            <TableCell className="font-medium">{org.name}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                {org.sector}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : '-'}
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
                                            <Link href={`/admin/organizations/edit/${org.id}`}>Redaktə Et</Link>
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Sil</DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Silməni təsdiq edirsiniz?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bu əməliyyat geri qaytarılmazdır. "{org.name}" təşkilatı sistemdən həmişəlik silinəcək.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(org.id)} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
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
                            <TableCell colSpan={4} className="h-24 text-center">Heç bir təşkilat tapılmadı.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="text-xs text-muted-foreground">
                Göstərilir <strong>1-{organizations?.length ?? 0}</strong> / <strong>{organizations?.length ?? 0}</strong>{" "}
                təşkilat
                </div>
            </CardFooter>
        </Card>
    )
}
