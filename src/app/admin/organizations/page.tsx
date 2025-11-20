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
import { getOrganizations } from "@/lib/data";
import { Organization } from "@/types";


export default function AdminOrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setOrganizations(getOrganizations());
    }, []);

    const filteredOrganizations = useMemo(() => {
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
                    {filteredOrganizations.map((org) => (
                    <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                            {org.sector}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            {new Date(org.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                            {/* Actions can be added here */}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="text-xs text-muted-foreground">
                Göstərilir <strong>{filteredOrganizations.length}</strong> / <strong>{organizations.length}</strong>{" "}
                təşkilat
                </div>
            </CardFooter>
        </Card>
    )
}
