'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { getAuth, signOut } from 'firebase/auth';
import type { AppUser } from '@/types';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Ana Səhifə' },
  { href: '/search', label: 'Axtarış' },
  { href: '/rankings', label: 'Reytinq' },
];

export function Header() {
  const { user, isUserLoading, profile } = useUser();
  const appUser = profile as AppUser | null;
  const pathname = usePathname();


  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  const getInitials = (displayName: string | null | undefined): string => {
    if (!displayName) return '';
    const names = displayName.split(' ');
    if (names.length > 1) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`;
    }
    return names[0].charAt(0);
  };

  const getDashboardLink = () => {
    if (!appUser) return '/';
    if (appUser.role === 'organization') return '/organization-dashboard';
    if (appUser.role === 'student') return '/student-dashboard';
    return `/`; 
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-3">
          <Logo className="h-14 w-auto" />
          <span className="hidden font-bold sm:inline-block text-base">
            İstedad Mərkəzi
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isUserLoading ? (
            <div className='h-10 w-10 bg-muted rounded-full animate-pulse' />
          ) : user && appUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                   <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()}>
                    {appUser.role === 'organization' ? 'Təşkilat Paneli' : 'Tələbə Paneli'}
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href={appUser.role === 'student' ? `/profile/${user.uid}` : '#'}>Profilimə bax</Link>
                </DropdownMenuItem>
                {appUser.role === 'student' && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit">Profili redaktə et</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Çıxış
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Giriş</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Qeydiyyat</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menyu aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <div className="flex items-center p-4 border-b">
                   <Link href="/" className="flex items-center space-x-3">
                    <Logo className="h-10 w-auto" />
                    <span className="font-bold text-base">
                      İstedad Mərkəzi
                    </span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 p-4 text-lg font-medium">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "transition-colors hover:text-foreground/80",
                        pathname === link.href ? "text-foreground" : "text-foreground/60"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-4 border-t flex flex-col gap-2">
                   {!user && !isUserLoading && (
                     <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/login">Giriş</Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/register">Qeydiyyat</Link>
                      </Button>
                     </>
                   )}
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
