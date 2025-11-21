import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-8">
        <div className="flex flex-col items-center text-center gap-8">
          
          {/* Logo and Title */}
          <Link href="/" className="flex flex-col items-center gap-3">
            <Logo className="h-20 w-auto" />
            <div>
              <p className="font-bold text-lg">İstedad Mərkəzi</p>
              <p className="text-sm text-primary-foreground/80">Naxçıvan Dövlət Universiteti</p>
            </div>
          </Link>

          {/* Links Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full max-w-4xl text-left sm:text-center">
            <div>
              <h3 className="font-semibold mb-4">Platforma</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground">Ana Səhifə</Link></li>
                <li><Link href="/search" className="text-primary-foreground/80 hover:text-primary-foreground">Axtarış</Link></li>
                <li><Link href="/rankings" className="text-primary-foreground/80 hover:text-primary-foreground">Reytinq</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Əlaqə</h3>
              <ul className="space-y-2 text-primary-foreground/80 text-sm">
                <li>Azərbaycan Respublikası, Naxçıvan şəhəri, Universitet şəhərciyi, AZ7012, Naxçıvan Dövlət Universiteti</li>
                <li>Tel: +994 36 544 08 61</li>
                <li>Daxili telefon: 1108</li>
                <li>Email: tedbir@ndu.edu.az</li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
               <h3 className="font-semibold mb-4">Bizi İzləyin</h3>
              <div className="flex space-x-4 justify-start sm:justify-center">
                <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground" aria-label="Facebook">
                  <Facebook size={20} />
                </Link>
                 <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground" aria-label="Instagram">
                  <Instagram size={20} />
                </Link>
                <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Copyright and Designer */}
           <div className="w-full pt-8 mt-4 border-t border-primary-foreground/10 text-sm text-primary-foreground/80 space-y-2">
                <p>&copy; {currentYear} Naxçıvan Dövlət Universiteti | Bütün hüquqlar qorunur.</p>
                <p>Naxçıvan Dövlət Universiteti | Tələbələrlə iş və tədbirlərin təşkili şöbəsi</p>
                <p>Designed by Hüseyn Tahirov</p>
           </div>
        </div>
      </div>
    </footer>
  );
}