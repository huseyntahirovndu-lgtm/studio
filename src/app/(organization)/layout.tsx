'use client';

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Newspaper, Settings, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { useEffect } from "react";
import type { StudentOrganization } from "@/types"; // Assuming the user leading the org will have a specific type or role marker.

// This layout is for Student Organization Leaders
const NAV_LINKS = [
    { href: "/student-organizations/dashboard", icon: Home, label: "Panel", exact: true },
    { href: "/student-organizations/updates", icon: Newspaper, label: "Yeniliklər" },
];

export default function StudentOrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();

  // This needs to be a more robust check. We need to verify if the logged-in user
  // is a leader of ANY student organization. This is a placeholder.
  const isOrgLeader = user?.role === 'student'; // This is NOT correct, just a placeholder for the concept.

  useEffect(() => {
    if (!loading && !isOrgLeader) {
        // router.push('/login');
        console.warn("Redirect would happen here, but is disabled for development. User is not an org leader.");
    }
  }, [user, loading, router, isOrgLeader]);

  if (loading || !isOrgLeader) {
      return <div className="flex h-screen items-center justify-center">Yüklənir və ya giriş tələb olunur...</div>;
  }
  
  const isActive = (href: string, exact?: boolean) => {
    return exact ? pathname === href : pathname.startsWith(href);
  }

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
