'use client';
import React from 'react';
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
import { categories } from '@/lib/data';

export default function AdminCategoriesPage() {

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">İstedad Kateqoriyaları</h1>
          <p className="text-muted-foreground">
            Tələbələrin bölündüyü əsas istedad sahələri.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Kateqoriya Siyahısı</CardTitle>
            <CardDescription>Kateqoriyalar mərkəzi `src/lib/data.ts` faylından idarə olunur.</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kateqoriya Adı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
