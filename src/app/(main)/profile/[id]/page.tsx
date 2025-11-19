'use client';
import { useAuth } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';
import { Student, Project, Achievement, Certificate, Organization } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Star, Linkedin, Github, Dribbble, Instagram, Link as LinkIcon, Award, Briefcase, FileText, Bookmark } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { getStudentById, getProjectsByStudentId, getAchievementsByStudentId, getCertificatesByStudentId } from '@/lib/data';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const { toast } = useToast();

  const studentId = typeof id === 'string' ? id : '';
  const organization = currentUser?.role === 'organization' ? currentUser as Organization : null;

  const [student, setStudent] = useState<Student | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      setIsLoading(true);
      const studentData = await getStudentById(studentId);
      if (studentData) {
        const studentProjects = await getProjectsByStudentId(studentId);
        const studentAchievements = await getAchievementsByStudentId(studentId);
        const studentCertificates = await getCertificatesByStudentId(studentId);
        
        const placeholder = PlaceHolderImages.find(p => p.id.includes(studentData.id.slice(-1))) || PlaceHolderImages[0];
        setStudent({
          ...studentData,
          profilePictureUrl: placeholder.imageUrl,
          profilePictureHint: placeholder.imageHint,
        });
        setProjects(studentProjects);
        setAchievements(studentAchievements);
        setCertificates(studentCertificates);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [studentId]);
  
  const isSaved = organization?.savedStudentIds?.includes(studentId);

  const handleBookmark = () => {
    if (!organization || !student) return;

    const currentSavedIds = organization.savedStudentIds || [];
    const newSavedStudentIds = isSaved
      ? currentSavedIds.filter(id => id !== student.id)
      : [...currentSavedIds, student.id];

    const updatedOrg = { ...organization, savedStudentIds: newSavedStudentIds };
    updateUser(updatedOrg);

    toast({
      title: isSaved ? "Siyahıdan çıxarıldı" : "Yadda saxlanıldı",
      description: `${student.firstName} ${student.lastName} ${isSaved ? 'yaddaş siyahısından çıxarıldı.' : 'yaddaş siyahısına əlavə edildi.'}`,
    });
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Yüklənir...</div>;
  }

  if (!student) {
    return <div className="container mx-auto py-8 text-center">Tələbə tapılmadı.</div>;
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 md:py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={student.profilePictureUrl} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback className="text-4xl">{getInitials(student.firstName, student.lastName)}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{`${student.firstName} ${student.lastName}`}</h1>
              <p className="text-muted-foreground">{student.major}</p>
              <p className="text-sm text-muted-foreground">{student.faculty}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold text-lg text-foreground">{student.talentScore || 'N/A'}</span>
                </div>
                <p className="text-sm text-muted-foreground">İstedad Balı</p>
              </div>
               {organization && (
                <Button onClick={handleBookmark} variant={isSaved ? 'default' : 'outline'} className="mt-4 w-full">
                  <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} />
                  {isSaved ? 'Yaddaşdan çıxar' : 'Yadda saxla'}
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Bacarıqlar</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                  {student.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle>Sosial Hesablar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  {student.linkedInURL && <SocialLink href={student.linkedInURL} icon={Linkedin} text="LinkedIn" />}
                  {student.githubURL && <SocialLink href={student.githubURL} icon={Github} text="GitHub" />}
                  {student.behanceURL && <SocialLink href={student.behanceURL} icon={Dribbble} text="Behance" />}
                  {student.instagramURL && <SocialLink href={student.instagramURL} icon={Instagram} text="Instagram" />}
                   {student.portfolioURL && <SocialLink href={student.portfolioURL} icon={LinkIcon} text="Portfolio" />}
              </CardContent>
          </Card>
        </div>

        {/* Right Content */}
        <div className="md:col-span-2 space-y-8">
            {projects && projects.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Briefcase /> Layihələr</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {projects.map((project) => (
                            <div key={project.id} className="py-4 first:pt-0 last:pb-0">
                                <h3 className="font-semibold">{project.title} <span className="text-sm font-normal text-muted-foreground">- {project.role}</span></h3>
                                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                {project.teamMembers && project.teamMembers.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1"><strong>Komanda:</strong> {project.teamMembers.join(', ')}</p>
                                )}
                                {project.link && <Button variant="link" asChild className="p-0 h-auto mt-1"><a href={project.link} target="_blank" rel="noopener noreferrer">Layihəyə bax</a></Button>}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {achievements && achievements.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award /> Nailiyyətlər</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                       {achievements.map((ach) => (
                           <div key={ach.id} className="py-4 first:pt-0 last:pb-0">
                               <div className="flex items-start justify-between">
                                  <div>
                                      <h3 className="font-semibold">{ach.name}</h3>
                                      <p className="text-sm text-muted-foreground">{ach.position} - {ach.level}</p>
                                      {ach.description && <p className="text-sm text-muted-foreground mt-1">{ach.description}</p>}
                                  </div>
                                  <p className="text-sm text-muted-foreground whitespace-nowrap pl-4">{new Date(ach.date).toLocaleDateString()}</p>
                               </div>
                                {ach.link && <Button variant="link" asChild className="p-0 h-auto mt-1"><a href={ach.link} target="_blank" rel="noopener noreferrer">Təsdiqə bax</a></Button>}
                           </div>
                       ))}
                    </CardContent>
                </Card>
            )}

            {certificates && certificates.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> Sertifikatlar</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {certificates.map((cert) => (
                            <a key={cert.id} href={cert.certificateURL} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                               <div className="bg-muted h-24 flex items-center justify-center">
                                   <FileText className="w-8 h-8 text-muted-foreground" />
                               </div>
                               <p className="p-2 text-xs text-center truncate">{cert.name}</p>
                            </a>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon: Icon, text }: { href: string; icon: React.ElementType; text: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Icon className="w-5 h-5" />
            <span>{text}</span>
        </a>
    );
}
