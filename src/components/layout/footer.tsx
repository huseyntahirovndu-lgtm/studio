import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Github, Linkedin, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-16 w-auto" />
              <div>
                <p className="font-bold text-lg">İstedad Mərkəzi</p>
                <p className="text-sm text-primary-foreground/80">Naxçıvan Dövlət Universiteti</p>
              </div>
            </Link>
             <p className="text-sm text-primary-foreground/80">
              &copy; {currentYear} Bütün hüquqlar qorunur.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
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
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Naxçıvan ş., Universitet şəhərciyi</li>
                <li>Tel: (+994 36) 545-29-23</li>
                <li>Email: info@ndu.edu.az</li>
              </ul>
            </div>
            <div>
               <h3 className="font-semibold mb-4">Bizi İzləyin</h3>
              <div className="flex space-x-4">
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
        </div>
      </div>
    </footer>
  );
}
