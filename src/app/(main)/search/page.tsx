'use client';
import { useState } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Student } from '@/types';
import { StudentCard } from '@/components/student-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: students, isLoading: isLoadingStudents } = useCollection<Student>(studentsQuery);

  const enrichedStudents = students?.map((student) => {
    const placeholder = PlaceHolderImages.find(p => p.id.slice(-1) === student.id.slice(-1)) || PlaceHolderImages[0];
    return {
      ...student,
      profilePictureUrl: placeholder.imageUrl,
      profilePictureHint: placeholder.imageHint,
    };
  });

  const filteredStudents = enrichedStudents?.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <div className="container mx-auto py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">İstedadları Kəşf Et</h1>
        <p className="text-muted-foreground">Platformadakı bütün istedadlı tələbələr arasında axtarış edin.</p>
      </div>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Ad, ixtisas və ya bacarıq üzrə axtar..."
          className="pl-10 w-full md:w-1/2 lg:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoadingStudents ? (
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <div className="h-48 w-full rounded-xl bg-muted animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted animate-pulse"></div>
                        <div className="h-4 w-1/2 rounded bg-muted animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents && filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">
              Axtarışınıza uyğun tələbə tapılmadı.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

    