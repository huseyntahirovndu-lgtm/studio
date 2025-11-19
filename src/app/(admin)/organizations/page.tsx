'use client';
import {
  File,
  ListFilter,
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
import { organizations } from "@/lib/data";


export default function AdminOrganizationsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Təşkilatlar</CardTitle>
                <CardDescription>
                Platformadakı partnyor təşkilatları idarə edin.
                </CardDescription>
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
                    {organizations.map((org) => (
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
                Göstərilir <strong>1-{organizations.length}</strong> / <strong>{organizations.length}</strong>{" "}
                təşkilat
                </div>
            </CardFooter>
        </Card>
    )
}
