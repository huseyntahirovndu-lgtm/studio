'use client';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
} from "lucide-react"
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
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
import { Organization } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";


export default function AdminOrganizationsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const organizationsQuery = useMemoFirebase(() => query(collection(firestore, "users"), where("role", "==", "organization")), [firestore]);
    const { data: organizations, isLoading } = useCollection<Organization>(organizationsQuery);
    
    const [searchTerm, setSearchTerm] = useState("");

    const handleDeleteOrganization = (orgId: string) => {
        const orgDocRef = doc(firestore, 'users', orgId);
        deleteDocumentNonBlocking(orgDocRef);
        toast({ title: "Təşkilat uğurla silindi." });
    };

    const filteredOrganizations = useMemo(() => {
        if (!organizations) return [];
        return organizations.filter(org => 
            org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.sector.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [organizations, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Təşkilatlar</CardTitle>
                <CardDescription>
                Platformadakı partnyor təşkilatları idarə edin.
                </CardDescription>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Təşkilat adı və ya sektora görə axtar..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                         <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Yüklənir...
                            </TableCell>
                        </TableRow>
                    ) : filteredOrganizations.length > 0 ? (
                        filteredOrganizations.map((org) => (
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
                                            <Link href={`/organization-profile/edit`}>Redaktə et</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Sil</DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Təsdiq edirsiniz?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bu əməliyyat geri qaytarılmazdır. "{org.name}" təşkilatı sistemdən həmişəlik silinəcək.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteOrganization(org.id)} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
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
                            <TableCell colSpan={4} className="h-24 text-center">
                                Təşkilat tapılmadı.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="text-xs text-muted-foreground">
                Göstərilir <strong>{filteredOrganizations.length}</strong> / <strong>{organizations?.length || 0}</strong>{" "}
                təşkilat
                </div>
            </CardFooter>
        </Card>
    )
}
