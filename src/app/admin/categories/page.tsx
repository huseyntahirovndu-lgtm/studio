'use client';
import React, { useState } from 'react';
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


export default function AdminCategoriesPage() {
  const firestore = useFirestore();
  const categoriesCollectionRef = collection(firestore, 'categories');
  const { data: categories, isLoading } = useCollection<CategoryData>(categoriesCollectionRef);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addDocumentNonBlocking(categoriesCollectionRef, { name: newCategoryName.trim() });
      setNewCategoryName('');
      setIsDialogOpen(false);
      toast({ title: "Kateqoriya uğurla əlavə edildi." });
    } else {
        toast({ variant: 'destructive', title: "Xəta", description: "Kateqoriya adı boş ola bilməz." });
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryDoc = doc(firestore, 'categories', categoryId);
    deleteDocumentNonBlocking(categoryDoc);
    toast({ title: "Kateqoriya uğurla silindi.", variant: "destructive" });
  };

  if(isLoading) {
    return <div>Yüklənir...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">İstedad Kateqoriyaları</h1>
          <p className="text-muted-foreground">
            Tələbələrin bölündüyü əsas istedad sahələrini idarə edin.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Kateqoriya Yarat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Kateqoriya Yarat</DialogTitle>
                    <DialogDescription>
                    Yeni bir istedad kateqoriyası əlavə edin. Bu, axtarış və filtr sistemlərində görünəcək.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Ad
                        </Label>
                        <Input
                            id="name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="col-span-3"
                            placeholder="Məs: Süni İntellekt"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Ləğv et</Button>
                    </DialogClose>
                    <Button onClick={handleAddCategory}>Yarat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kateqoriya Adı</TableHead>
                <TableHead className="text-right">Əməliyyatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                             <AlertDialogHeader>
                                <AlertDialogTitle>Təsdiq edirsiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bu əməliyyat geri qaytarılmazdır. "{category.name}" kateqoriyası sistemdən silinəcək.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90">Bəli, sil</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
