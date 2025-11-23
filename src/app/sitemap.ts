import { getDocs, collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase'; // Assuming this can run server-side
import { Student, News } from '@/types';

// This is a simplified, conceptual approach.
// In a real Next.js app, you'd need a serverless function or API route
// to generate this, and it would need read-only admin access to Firestore.

const BASE_URL = 'https://istedadmerkezi.net';

export default async function sitemap() {
  const { firestore } = initializeFirebase();

  // Static pages
  const routes = ['', '/search', '/rankings', '/məqalələr'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // Dynamic student pages
  const studentsSnapshot = await getDocs(collection(firestore, 'users'));
  const studentUrls = studentsSnapshot.docs
    .map(doc => doc.data() as Student)
    .filter(user => user.role === 'student' && user.status === 'təsdiqlənmiş')
    .map((student) => ({
      url: `${BASE_URL}/profile/${student.id}`,
      lastModified: new Date().toISOString(), // Or use an 'updatedAt' field if you have one
  }));

  // Dynamic news pages
  const newsSnapshot = await getDocs(collection(firestore, 'news'));
  const newsUrls = newsSnapshot.docs.map((doc) => {
    const news = doc.data() as News;
    return {
      url: `${BASE_URL}/məqalələr/${news.slug}`,
      lastModified: news.updatedAt?.toDate().toISOString() || news.createdAt.toDate().toISOString(),
    };
  });

  return [...routes, ...studentUrls, ...newsUrls];
}
