'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getStudents, faculties, categories } from '@/lib/data';
import { Student } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default function RankingsPage() {
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [enrichedStudents, setEnrichedStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Simulate fetching data
    const allStudents = getStudents();
    const studentsWithPics = allStudents.map((student, index) => {
      const placeholder = PlaceHolderImages.find(p => p.id.slice(-1) === student.id.slice(-1)) || PlaceHolderImages[index % PlaceHolderImages.length];
      return {
        ...student,
        profilePictureUrl: placeholder.imageUrl,
        profilePictureHint: placeholder.imageHint,
      };
    });
    setEnrichedStudents(studentsWithPics);
    setIsLoading(false);
  }, []);

  const rankedStudents = useMemo(() => {
    return enrichedStudents
      ?.filter(student => {
        const facultyMatch = facultyFilter === 'all' || student.faculty === facultyFilter;
        const categoryMatch = categoryFilter === 'all' || student.category.includes(categoryFilter);
        return facultyMatch && categoryMatch;
      })
      .sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0));
  }, [enrichedStudents, facultyFilter, categoryFilter]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-amber-400 text-amber-900';
    if (rank === 2) return 'bg-slate-300 text-slate-800';
    if (rank === 3) return 'bg-amber-600/50 text-amber-900';
    return 'bg-muted text-muted-foreground';
  }
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }

  return (
    <div className="container mx-auto py-8 md:py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">İstedadlar Reytinqi</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Platformadakı ən yüksək istedad balına sahib tələbələri kəşf edin. Fakültə və kateqoriya üzrə filtrləyərək nəticələri özəlləşdirin.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          {isLoading ? <Skeleton className="h-10 w-full" /> : (
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Fakültə seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Fakültələr</SelectItem>
                {faculties?.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {isLoading ? <Skeleton className="h-10 w-full" /> : (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kateqoriya seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Kateqoriyalar</SelectItem>
                {categories?.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-16 text-center">Reytinq</TableHead>
                    <TableHead>Tələbə</TableHead>
                    <TableHead className="hidden md:table-cell">Fakültə</TableHead>
                    <TableHead className="hidden sm:table-cell">Kateqoriya</TableHead>
                    <TableHead className="text-right">İstedad Balı</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {rankedStudents && rankedStudents.length > 0 ? (
                    rankedStudents.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="text-center">
                            <Badge className={`text-sm w-8 h-8 flex items-center justify-center rounded-full ${getRankBadge(index + 1)}`}>
                                {index < 3 ? <Trophy className="w-4 h-4" /> : index + 1}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Link href={`/profile/${student.id}`} className="flex items-center gap-3 group">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={student.profilePictureUrl} alt={`${student.firstName} ${student.lastName}`} />
                                    <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium group-hover:underline">{`${student.firstName} ${student.lastName}`}</div>
                            </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{student.faculty}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary">{student.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-amber-500">{student.talentScore}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Filtrlərə uyğun tələbə tapılmadı.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
      )}
    </div>
  );
}
