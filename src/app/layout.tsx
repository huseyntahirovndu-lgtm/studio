'use client';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { SessionProvider } from '@/hooks/use-auth';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname.startsWith('/register');
  
  return (
    <html lang="az">
      <head>
        <title>İstedad Mərkəzi - Naxçıvan Dövlət Universiteti</title>
        <meta name="description" content="Naxçıvan Dövlət Universitetinin istedadlı tələbələrini kəşf edin." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background antialiased">
        <FirebaseClientProvider>
          <SessionProvider>
            {isAuthPage ? (
              <main className="flex min-h-screen items-center justify-center bg-background p-4">
                {children}
              </main>
            ) : (
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            )}
            <Toaster />
          </SessionProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
