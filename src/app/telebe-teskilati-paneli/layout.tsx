'use client';

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Newspaper, Settings, Users, Library } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { useEffect, createContext, useContext } from "react";
import type { StudentOrganization } from "@/types";
import { useToast } from "@/hooks/use-toast";

const NAV_LINKS = [
    { href: "/telebe-teskilati-paneli/dashboard", icon: Home, label: "Panel", exact: true },
    { href: "/telebe-teskilati-paneli/members", icon: Users, label: "Üzvlər" },
    { href: "/telebe-teskilati-paneli/updates", icon: Newspaper, label: "Yeniliklər" },
];

interface OrgContextType {
    organization: StudentOrganization | null;
    isLoading: boolean;
}

const StudentOrgContext = createContext<OrgContextType | null>(null);

export const useStudentOrg = () => {
    const context = useContext(StudentOrgContext);
    if (!context) {
        throw new Error('useStudentOrg must be used within a StudentOrganizationLayout');
    }
    return context;
}

export default function StudentOrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const organization = user as StudentOrganization | null;
  const isLoading = authLoading;

  useEffect(() => {
    if (!isLoading && user?.role !== 'student-organization') {
        toast({ title: "Səlahiyyət Xətası", description: "Bu səhifəyə yalnız təşkilat hesabları daxil ola bilər.", variant: "destructive"});
        router.push('/login');
    }
     if (!isLoading && user?.role === 'student-organization' && (user as StudentOrganization).status !== 'təsdiqlənmiş') {
        toast({ title: "Gözləmədə Olan Hesab", description: "Təşkilat hesabınız hələ admin tərəfindən təsdiqlənməyib.", variant: "destructive"});
        router.push('/');
     }

  }, [isLoading, user, router, toast]);

  if (isLoading || user?.role !== 'student-organization' || (user as StudentOrganization).status !== 'təsdiqlənmiş') {
      return <div className="flex h-screen items-center justify-center">Yüklənir və ya səlahiyyət yoxlanılır...</div>;
  }
  
  const isActive = (href: string, exact?: boolean) => {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <StudentOrgContext.Provider value={{ organization, isLoading: authLoading }}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <TooltipProvider>
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link
                    href="/"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <Library className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">Tələbə Təşkilatı Paneli</span>
                </Link>

                {NAV_LINKS.map(link => (
                    <Tooltip key={link.href}>
                        <TooltipTrigger asChild>
                        <Link
                            href={link.href}
                            className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                isActive(link.href, link.exact) && "bg-accent text-accent-foreground"
                            )}
                        >
                            <link.icon className="h-5 w-5" />
                            <span className="sr-only">{link.label}</span>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{link.label}</TooltipContent>
                    </Tooltip>
                ))}
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Link
                        href="/profile/edit"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Profil Ayarları</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Profil Ayarları</TooltipContent>
                </Tooltip>
                </nav>
            </TooltipProvider>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                {children}
            </main>
        </div>
        </div>
    </StudentOrgContext.Provider>
  )
}
