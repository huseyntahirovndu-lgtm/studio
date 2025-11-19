'use client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Briefcase } from 'lucide-react';

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Qeydiyyat</CardTitle>
        <CardDescription>
          Platformaya qoşulmaq üçün hesab növünü seçin.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <Link href="/register-student" legacyBehavior passHref>
          <a className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-center">
            <User className="h-12 w-12 mb-4" />
            <h3 className="font-semibold">Tələbə kimi</h3>
            <p className="text-sm text-muted-foreground mt-1">Profil yaradın, bacarıqlarınızı və layihələrinizi nümayiş etdirin.</p>
          </a>
        </Link>
         <Link href="/register-organization" legacyBehavior passHref>
          <a className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-center">
            <Briefcase className="h-12 w-12 mb-4" />
            <h3 className="font-semibold">Təşkilat kimi</h3>
            <p className="text-sm text-muted-foreground mt-1">İstedadları kəşf edin, komanda formalaşdırın və layihələr həyata keçirin.</p>
          </a>
        </Link>
      </CardContent>
      <CardFooter className="text-center text-sm justify-center">
        Artıq hesabınız var?{' '}
        <Button variant="link" asChild>
           <Link href="/login">Daxil olun</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
