import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Award, Star } from 'lucide-react';
import type { Student } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  className?: string;
}

const categoryColors: { [key in Student['mainCategory']]: string } = {
  STEM: 'bg-category-stem',
  Humanitar: 'bg-category-humanitarian',
  İncəsənət: 'bg-category-art',
  İdman: 'bg-category-sport',
  Sahibkarlıq: 'bg-category-entrepreneurship',
  Texnologiya: 'bg-category-technology',
};


export function StudentCard({ student, className }: StudentCardProps) {
  const {
    name,
    surname,
    faculty,
    profilePictureUrl,
    profilePictureHint,
    skills,
    talentScore,
    id,
    mainCategory
  } = student;
  
  const categoryColor = categoryColors[mainCategory] || 'bg-muted';

  return (
    <Card className={cn("flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1", className)}>
      <CardHeader className="p-0 relative">
        <div className={`h-2 w-full ${categoryColor}`}></div>
        <div className="p-6 flex items-center gap-4">
          <Avatar className="h-16 w-16 border-4 border-background shadow-md">
            <AvatarImage src={profilePictureUrl} alt={`${name} ${surname}`} data-ai-hint={profilePictureHint} />
            <AvatarFallback>{name.charAt(0)}{surname.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{`${name} ${surname}`}</h3>
            <p className="text-sm text-muted-foreground">{faculty}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold text-lg text-foreground">{talentScore}</span>
            </div>
            <p className="text-sm text-muted-foreground">İstedad balı</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Əsas bacarıqlar:</p>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="secondary" className="font-normal">
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && <Badge variant="outline">+{skills.length - 4}</Badge>}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/profile/${id}`}>
            Profili Gör <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
