
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-primary text-primary-foreground">
      <div className="w-full container px-4 md:px-8 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Logo and Title */}
          <div className="flex flex-col items-start gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-12 w-auto" />
              <div>
                <p className="font-bold text-base">İstedad Mərkəzi</p>
                <p className="text-xs text-primary-foreground/90">Naxçıvan Dövlət Universiteti</p>
              </div>
            </Link>
          </div>

          {/* Platforma */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Platforma</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm">
                  Ana Səhifə
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm">
                  Axtarış
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm">
                  Reytinq
                </Link>
              </li>
            </ul>
          </div>

          {/* Əlaqə */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Əlaqə</h3>
            <ul className="space-y-2.5 text-primary-foreground/90 text-sm">
              <li>Azərbaycan Respublikası, Naxçıvan şəhəri, Universitet şəhərciyi, AZ7012, Naxçıvan Dövlət Universiteti</li>
              <li>Tel: +994 36 544 08 61</li>
              <li>Daxili telefon: 1108</li>
              <li>Email: tedbir@ndu.edu.az</li>
            </ul>
          </div>

          {/* Bizi İzləyin */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Bizi İzləyin</h3>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/ndu.edu.az/?locale=tr_TR" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-foreground/90 hover:text-primary-foreground transition-colors" 
                aria-label="Facebook"
              >
                <Facebook size={22} />
              </a>
              <a 
                href="https://www.instagram.com/ndu.edu.az/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-foreground/90 hover:text-primary-foreground transition-colors" 
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
              <a 
                href="https://az.linkedin.com/school/nax%C3%A7%C4%B1van-d%C3%B6vl%C9%99t-universiteti/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-foreground/90 hover:text-primary-foreground transition-colors" 
                aria-label="LinkedIn"
              >
                <Linkedin size={22} />
              </a>
              <a 
                href="https://www.youtube.com/channel/UCdebBI5bSkr4uQHFrTD2bNQ" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-foreground/90 hover:text-primary-foreground transition-colors" 
                aria-label="YouTube"
              >
                <Youtube size={22} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="w-full pt-6 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs text-primary-foreground/80">
          <div className="space-y-1">
            <p>&copy; {currentYear} Naxçıvan Dövlət Universiteti | Bütün hüquqlar qorunur.</p>
            <p>Naxçıvan Dövlət Universiteti | Tələbələrlə iş və tədbirlərin təşkili şöbəsi</p>
          </div>
          <p className="md:text-right">Designed by Hüseyn Tahirov</p>
        </div>
      </div>
    </footer>
  );
}
