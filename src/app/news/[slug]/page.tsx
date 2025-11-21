'use client';
import { useParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { News } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function NewsDetailsPage() {
    const { slug } = useParams();
    const firestore = useFirestore();
    
    const newsSlug = typeof slug === 'string' ? slug : '';

    const newsQuery = useMemoFirebase(() => 
        newsSlug ? query(collection(firestore, 'news'), where('slug', '==', newsSlug), limit(1)) : null,
        [firestore, newsSlug]
    );
    const { data, isLoading } = useCollection<News>(newsQuery);

    const newsItem = data?.[0];

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="container mx-auto max-w-3xl py-8 md:py-12 px-4 space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <div className="flex gap-4">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-5 w-1/4" />
                    </div>
                    <Skeleton className="aspect-video w-full" />
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!newsItem) {
        return (
            <>
                <Header />
                <div className="container mx-auto py-16 text-center">
                    <h1 className="text-2xl font-bold">Xəbər Tapılmadı</h1>
                    <p className="text-muted-foreground">Bu ünvanda heç bir xəbər mövcud deyil.</p>
                </div>
                <Footer />
            </>
        );
    }
    
    const sanitizedContent = typeof window !== 'undefined' ? DOMPurify.sanitize(newsItem.content) : newsItem.content;


    return (
        <>
            <Header />
            <div className="container mx-auto max-w-3xl py-8 md:py-12 px-4">
                <article className="prose dark:prose-invert max-w-none">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{newsItem.title}</h1>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{newsItem.authorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{newsItem.createdAt ? format(newsItem.createdAt.toDate(), 'dd MMMM, yyyy') : ''}</span>
                        </div>
                    </div>

                    {newsItem.coverImageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                            <Image src={newsItem.coverImageUrl} alt={newsItem.title} fill className="object-cover" />
                        </div>
                    )}
                    
                    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

                </article>
            </div>
            <Footer />
        </>
    );
}
