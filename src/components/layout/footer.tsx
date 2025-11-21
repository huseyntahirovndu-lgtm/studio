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
            <div className="text-sm text-primary-foreground/80">
              <p>&copy; {currentYear} Bütün hüquqlar qorunur.</p>
              <p>Designed by Hüseyn Tahirov</p>
              <p>Naxçıvan Dövlət Universiteti | Tələbələrlə iş və tədbirlərin təşkili şöbəsi</p>
            </div>
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
                <li>Azərbaycan Respublikası, Naxçıvan şəhəri, Universitet şəhərciyi, AZ7012, Naxçıvan Dövlət Universiteti</li>
                <li>Tel: +994 36 544 08 61</li>
                <li>(daxili: 1909)</li>
                <li>Email: tedbir@ndu.edu.az</li>
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
