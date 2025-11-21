'use client';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { SessionProvider } from '@/hooks/use-auth';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
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
            {children}
            <Toaster />
          </SessionProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
