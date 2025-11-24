'use client';

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Users2, Library, Newspaper, School, ListTree, Settings, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const NAV_LINKS = [
    { href: "/admin/dashboard", icon: Home, label: "Panel", exact: true },
    { href: "/admin/students", icon: Users2, label: "Tələbələr" },
    { href: "/admin/telebe-teskilatlari", icon: Library, label: "Tələbə Təşkilatları" },
    { href: "/admin/news", icon: Newspaper, label: "Xəbərlər" },
    { href: "/admin/faculties", icon: School, label: "Fakültələr" },
    { href: "/admin/categories", icon: ListTree, label: "Kateqoriyalar" },
];


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      toast({
        title: "Səlahiyyət Xətası",
        description: "Bu səhifəyə yalnız adminlər daxil ola bilər.",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [user, loading, router, toast]);

  
  const isActive = (href: string, exact?: boolean) => {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  // While loading or if user is not an admin, show a loading/permission check screen.
  // This prevents child components from rendering with incorrect auth state.
  if (loading || user?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Yoxlanılır...</p>
        </div>
      </div>
    );
  }

  // Once auth check is complete and user is an admin, render the actual layout.
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
                href="/"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
                <ShieldCheck className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">İstedad Mərkəzi</span>
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
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Ayarlar</span>
                </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Ayarlar</TooltipContent>
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
  )
}
