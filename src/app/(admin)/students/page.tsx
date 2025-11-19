'use client';
import {
  File,
  ListFilter,
} from "lucide-react"

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
import { students } from "@/lib/data";


export default function AdminStudentsPage() {
    return (
        <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">Hamısı</TabsTrigger>
                <TabsTrigger value="active">Təsdiqlənmiş</TabsTrigger>
                <TabsTrigger value="draft">Gözləyən</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
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
                    <DropdownMenuCheckboxItem checked>
                      Memarlıq və Mühəndislik
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      İqtisadiyyat və İdarəetmə
                    </DropdownMenuCheckboxItem>
                     <DropdownMenuCheckboxItem>
                      Tibb
                    </DropdownMenuCheckboxItem>
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
                          <span className="sr-only">Actions</span>
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
                                <Badge variant="outline">Təsdiqlənib</Badge>
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
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                                    <DropdownMenuItem>Redaktə et</DropdownMenuItem>
                                    <DropdownMenuItem>Sil</DropdownMenuItem>
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
                    Showing <strong>1-10</strong> of <strong>{students.length}</strong>{" "}
                    products
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
    )
}
