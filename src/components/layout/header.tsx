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

const navLinks = [
  { href: '/', label: 'Ana Səhifə' },
  { href: '/search', label: 'Axtarış' },
  { href: '/rankings', label: 'Reytinq' },
];

export function Header() {
  const { user, isUserLoading } = useUser();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary text-primary-foreground">
      <div className="container flex h-24 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-3">
          <Logo className="h-16 w-auto" />
          <span className="hidden font-bold sm:inline-block text-lg">
            İstedad Mərkəzi
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary-foreground/80 text-primary-foreground/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isUserLoading ? (
            <div className='h-10 w-10 bg-primary-foreground/10 rounded-full animate-pulse' />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary-foreground/10">
                   <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName?.split(' ')[0], user.displayName?.split(' ')[1])}</AvatarFallback>
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
                  <Link href={`/profile/${user.uid}`}>Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Çıxış
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" className="hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="/login">Giriş</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/register">Qeydiyyat</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menyu aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-primary text-primary-foreground">
              <div className="flex flex-col h-full">
                <div className="flex items-center p-4 border-b border-primary-foreground/20">
                   <Link href="/" className="flex items-center space-x-3">
                    <Logo className="h-10 w-auto" />
                    <span className="font-bold text-lg">
                      İstedad Mərkəzi
                    </span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 p-4 text-lg font-medium">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="transition-colors hover:text-primary-foreground/80 text-primary-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-4 border-t border-primary-foreground/20 flex flex-col gap-2">
                   {!user && !isUserLoading && (
                     <>
                      <Button variant="ghost" className="hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                        <Link href="/login">Giriş</Link>
                      </Button>
                      <Button variant="secondary" asChild>
                        <Link href="/register">Qeydiyyat</Link>
                      </Button>
                     </>
                   )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
