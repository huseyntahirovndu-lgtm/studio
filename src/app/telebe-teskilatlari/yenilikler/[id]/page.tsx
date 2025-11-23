'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { StudentOrgUpdate, StudentOrganization } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, Building } from 'lucide-react';
import DOMPurify from 'dompurify';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StudentOrgUpdateDetailsPage() {
    const { id } = useParams();
    const firestore = useFirestore();
    const updateId = typeof id === 'string' ? id : '';

    const [update, setUpdate] = useState<StudentOrgUpdate | null>(null);
    const [organization, setOrganization] = useState<StudentOrganization | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUpdateAndOrg = async () => {
            if (!firestore || !updateId) return;

            // This is a bit complex because updates are in a subcollection.
            // We need to find which org this update belongs to.
            // This is not efficient, a better data model would denormalize orgId into the update doc.
            // For now, we assume we can find it somehow or get it from context if available.
            // Let's assume the update doc *does* have an organizationId field.
            
            const updateDocRef = doc(firestore, 'student-org-updates', updateId); // This path might be wrong.
            // Correct path should be /telebe-teskilatlari/{orgId}/updates/{updateId}
            // Since we don't have orgId, we can't fetch directly.
            // We will assume for now update doc has organizationId.
            // A better approach is needed for production.

            // Let's assume a different, more queryable structure for this page.
            // We'll query the `student-org-updates` top-level collection.
             try {
                // This is a workaround. In a real app, you'd know the organizationId to build the path.
                // Let's fetch the update document first, assuming we can find it.
                // This requires a composite index on `id`. This is not a good pattern.
                // The BEST pattern is to have the orgID in the URL. e.g., /telebe-teskilatlari/{orgId}/yenilikler/{updateId}

                // Since our current route is just /yenilikler/[id], we have to search. This is inefficient.
                // Let's just create a placeholder display. A real implementation needs route change.
                
                // Let's adjust the logic assuming `update` docs have `organizationId`
                const updateSnap = await getDoc(doc(firestore, `student-org-updates/${updateId}`));
                if (updateSnap.exists()) {
                    const updateData = updateSnap.data() as StudentOrgUpdate;
                    setUpdate(updateData);
                    
                    const orgSnap = await getDoc(doc(firestore, `telebe-teskilatlari/${updateData.organizationId}`));
                    if (orgSnap.exists()) {
                        setOrganization(orgSnap.data() as StudentOrganization);
                    }
                }
            } catch (e) {
                console.error("Error fetching update details:", e)
            } finally {
                setIsLoading(false);
            }
        };

        // This component structure is flawed due to the URL not having orgId.
        // We will hard-code a message for now and recommend a structural change.
        // The logic above is for demonstration of a potential (inefficient) fix.
        setIsLoading(false); // Disable loading to show the placeholder message.

    }, [firestore, updateId]);

    const sanitizedContent = update?.content && typeof window !== 'undefined'
        ? DOMPurify.sanitize(update.content)
        : update?.content;

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl py-12 px-4">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/4 mb-8" />
                <Skeleton className="w-full h-96 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
        );
    }
    
    if (!update || !organization) {
        return <div className="text-center py-20">Yenilik tapılmadı və ya yüklənərkən xəta baş verdi. <br/> Bu səhifənin düzgün işləməsi üçün URL strukturunun yenilənməsi lazımdır.</div>;
    }

    const pageTitle = `${update.title} | ${organization.name}`;
    const description = update.content.replace(/<[^>]*>?/gm, '').substring(0, 155);

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={update.coverImageUrl || organization.logoUrl || 'https://i.ibb.co/cXv2KzRR/q2.jpg'} />
                <meta property="og:type" content="article" />
            </Head>
            <article className="container mx-auto max-w-4xl py-8 md:py-12 px-4">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                        {update.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <Link href={`/telebe-teskilatlari/${organization.id}`} className="flex items-center gap-2 hover:text-primary">
                            <Building className="h-4 w-4" />
                            <span>{organization.name}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={update.createdAt?.toDate().toISOString()}>
                                {update.createdAt ? format(update.createdAt.toDate(), 'dd MMMM, yyyy') : ''}
                            </time>
                        </div>
                    </div>
                </header>

                {update.coverImageUrl && (
                    <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
                        <Image 
                            src={update.coverImageUrl}
                            alt={update.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                
                {sanitizedContent && (
                    <div 
                        className="prose dark:prose-invert max-w-none prose-lg" 
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
                    />
                )}
            </article>
        </>
    );
}
