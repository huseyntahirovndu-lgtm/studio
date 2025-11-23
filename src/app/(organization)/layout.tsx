'use client';

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Newspaper, Settings, Users, Library } from "lucide-react"
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react";
import type { StudentOrganization } from "@/types";
import { collection, query, where } from "firebase/firestore";

const NAV_LINKS = [
    { href: "/organization-panel/dashboard", icon: Home, label: "Panel", exact: true },
    { href: "/organization-panel/members", icon: Users, label: "Üzvlər" },
    { href: "/organization-panel/updates", icon: Newspaper, label: "Yeniliklər" },
];

export default function StudentOrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();

  const ledOrgQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'telebe-teskilatlari'), where('leaderId', '==', user.id), where('status', '==', 'təsdiqlənmiş')) : null,
    [firestore, user]
  );
  const { data: ledOrgs, isLoading: ledOrgsLoading } = useCollection<StudentOrganization>(ledOrgQuery);

  const isOrgLeader = ledOrgs && ledOrgs.length > 0;

  useEffect(() => {
    if (!loading && !ledOrgsLoading && !isOrgLeader) {
        router.push('/');
    }
  }, [user, loading, router, isOrgLeader, ledOrgsLoading]);

  if (loading || ledOrgsLoading || !isOrgLeader) {
      return <div className="flex h-screen items-center justify-center">Yüklənir və ya səlahiyyət yoxlanılır...</div>;
  }
  
  const isActive = (href: string, exact?: boolean) => {
    // Correctly match the dashboard route and its children
    const adjustedHref = href.replace('-panel', '');
    return exact ? pathname === adjustedHref : pathname.startsWith(adjustedHref);
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
                <Library className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">Tələbə Təşkilatı Paneli</span>
            </Link>

            {NAV_LINKS.map(link => (
                <Tooltip key={link.href}>
                    <TooltipTrigger asChild>
                    <Link
                        href={link.href.replace('-panel', '')}
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
  )
}
