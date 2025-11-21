'use client';
import React, { useState } from 'react';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react";
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
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export default function AdminCategoriesPage() {
  const firestore = useFirestore();
  const categoriesCollection = collection(firestore, 'categories');
  const { data: categories, isLoading } = useCollection<CategoryData>(categoriesCollection);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const { toast } = useToast();

  const handleSaveCategory = () => {
    const categoryName = editingCategory ? editingCategory.name : newCategoryName;

    if (categoryName.trim()) {
      if (editingCategory) {
        // Update existing category
        const categoryDoc = doc(firestore, 'categories', editingCategory.id);
        updateDocumentNonBlocking(categoryDoc, { name: categoryName.trim() });
        toast({ title: "Kateqoriya uğurla yeniləndi." });
      } else {
        // Add new category
        addDocumentNonBlocking(categoriesCollection, { name: categoryName.trim() });
        toast({ title: "Kateqoriya uğurla əlavə edildi." });
      }
      closeDialog();
    } else {
      toast({ variant: 'destructive', title: "Xəta", description: "Kateqoriya adı boş ola bilməz." });
    }
  };
  
  const closeDialog = () => {
    setNewCategoryName('');
    setEditingCategory(null);
    setIsDialogOpen(false);
  }

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
                <Button onClick={() => setEditingCategory(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Kateqoriya Yarat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={closeDialog}>
                <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Kateqoriyanı Redaktə Et' : 'Yeni Kateqoriya Yarat'}</DialogTitle>
                    <DialogDescription>
                    {editingCategory ? `"${editingCategory.name}" kateqoriyasının adını dəyişin.` : 'Yeni bir istedad kateqoriyası əlavə edin. Bu, axtarış və filtr sistemlərində görünəcək.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Ad
                        </Label>
                        <Input
                            id="name"
                            value={editingCategory ? editingCategory.name : newCategoryName}
                            onChange={(e) => editingCategory ? setEditingCategory({...editingCategory, name: e.target.value}) : setNewCategoryName(e.target.value)}
                            className="col-span-3"
                            placeholder="Məs: Süni İntellekt"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeDialog}>Ləğv et</Button>
                    <Button onClick={handleSaveCategory}>{editingCategory ? 'Yadda Saxla' : 'Yarat'}</Button>
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
                    <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(category); setIsDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                    </Button>
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
