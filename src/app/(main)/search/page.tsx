'use client';
import { useState, useMemo } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Student } from '@/types';
import { StudentCard } from '@/components/student-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';


export default function SearchPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'student'));
  }, [firestore]);
  
  const facultiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'faculties') : null, [firestore]);
  const categoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);

  const { data: students, isLoading: isLoadingStudents } = useCollection<Student>(studentsQuery);
  const { data: faculties, isLoading: isLoadingFaculties } = useCollection(facultiesQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection(categoriesQuery);


  const enrichedStudents = useMemo(() => students?.map((student) => {
    const placeholder = PlaceHolderImages.find(p => p.id.slice(-1) === student.id.slice(-1)) || PlaceHolderImages[0];
    return {
      ...student,
      profilePictureUrl: placeholder.imageUrl,
      profilePictureHint: placeholder.imageHint,
    };
  }), [students]);

  const filteredStudents = useMemo(() => {
    return enrichedStudents?.filter(student => {
      if (student.role !== 'student') return false;

      const searchTermMatch =
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.skills && student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));

      const facultyMatch = facultyFilter === 'all' || student.faculty === facultyFilter;
      const courseMatch = courseFilter === 'all' || student.courseYear === parseInt(courseFilter);
      const categoryMatch = categoryFilter === 'all' || student.category === categoryFilter;

      return searchTermMatch && facultyMatch && courseMatch && categoryMatch;
    });
  }, [enrichedStudents, searchTerm, facultyFilter, courseFilter, categoryFilter]);


  return (
    <div className="container mx-auto py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">İstedadları Kəşf Et</h1>
        <p className="text-muted-foreground">Platformadakı bütün istedadlı tələbələr arasında axtarış edin və filtrləyin.</p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ad, ixtisas və ya bacarıq üzrə axtar..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoadingFaculties ? <Skeleton className="h-10 w-full" /> : (
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
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kurs seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Kurslar</SelectItem>
                <SelectItem value="1">1-ci kurs</SelectItem>
                <SelectItem value="2">2-ci kurs</SelectItem>
                <SelectItem value="3">3-cü kurs</SelectItem>
                <SelectItem value="4">4-cü kurs</SelectItem>
              </SelectContent>
            </Select>
            {isLoadingCategories ? <Skeleton className="h-10 w-full" /> : (
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
      </div>

      {isLoadingStudents ? (
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
               <Card key={i}>
                    <div className="p-0 relative">
                        <Skeleton className="h-2 w-full" />
                        <div className="p-6 flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                    <CardContent className="space-y-4">
                       <div className="flex items-center gap-2">
                           <Skeleton className="h-6 w-12" />
                           <Skeleton className="h-4 w-20" />
                       </div>
                       <div className="flex flex-wrap gap-2">
                           <Skeleton className="h-6 w-16" />
                           <Skeleton className="h-6 w-20" />
                           <Skeleton className="h-6 w-12" />
                       </div>
                    </CardContent>
                    <CardFooter>
                       <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {filteredStudents?.length} nəticə tapıldı.
          </p>
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStudents && filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-16">
                Axtarışınıza uyğun tələbə tapılmadı.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
