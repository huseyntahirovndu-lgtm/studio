'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { News } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

function NewsCard({ news }: { news: News }) {
    return (
        <Card className="overflow-hidden flex flex-col group">
            <Link href={`/news/${news.slug}`} className="block">
                <div className="relative aspect-video bg-muted">
                    {news.coverImageUrl ? (
                        <Image
                            src={news.coverImageUrl}
                            alt={news.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">Şəkil yoxdur</p>
                        </div>
                    )}
                </div>
            </Link>
            <CardHeader>
                <CardTitle className="line-clamp-2">
                    <Link href={`/news/${news.slug}`} className="hover:text-primary transition-colors">{news.title}</Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <div
                    className="text-sm text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: news.content.substring(0, 150) + '...' }}
                />
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-between">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{news.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                     <span>{news.createdAt ? format(news.createdAt.toDate(), 'dd.MM.yyyy') : ''}</span>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function NewsPage() {
    const firestore = useFirestore();
    const newsQuery = useMemoFirebase(() => query(collection(firestore, "news"), orderBy("createdAt", "desc")), [firestore]);
    const { data: news, isLoading } = useCollection<News>(newsQuery);

    return (
        <>
            <Header />
            <div className="container mx-auto py-8 md:py-12 px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Xəbərlər və Elanlar</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Platforma və universitet həyatı ilə bağlı ən son yeniliklərdən xəbərdar olun.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                                <Skeleton className="h-48 w-full" />
                                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full mt-2" />
                                    <Skeleton className="h-4 w-2/3 mt-2" />
                                </CardContent>
                                <CardFooter>
                                    <Skeleton className="h-4 w-1/2" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : news && news.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map(item => <NewsCard key={item.id} news={item} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg">Heç bir xəbər tapılmadı.</p>
                        <p>Tezliklə yeni xəbərlər əlavə olunacaq.</p>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
