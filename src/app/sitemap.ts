import { getDocs, collection } from 'firebase/firestore';
import { initializeServerFirebase } from '@/firebase/server-init';
import { Student, News, StudentOrganization } from '@/types';

const BASE_URL = 'https://istedadmerkezi.net';

export default async function sitemap() {
  const { firestore } = initializeServerFirebase();

  // Static pages
  const routes = ['', '/search', '/rankings', '/telebe-teskilatlari'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
  }));

  let studentUrls: any[] = [];
  try {
    const studentsSnapshot = await getDocs(collection(firestore, 'users'));
    studentUrls = studentsSnapshot.docs
      .map(doc => doc.data() as Student)
      .filter(user => user.role === 'student' && user.status === 'təsdiqlənmiş')
      .map((student) => ({
        url: `${BASE_URL}/profile/${student.id}`,
        lastModified: new Date().toISOString(), 
    }));
  } catch (e) {
    console.error("Could not fetch students for sitemap", e);
  }

  let orgUrls: any[] = [];
    try {
        const orgsSnapshot = await getDocs(collection(firestore, 'student-organizations'));
        orgUrls = orgsSnapshot.docs.map((doc) => {
            const org = doc.data() as StudentOrganization;
            return {
                url: `${BASE_URL}/telebe-teskilatlari/${org.id}`,
                lastModified: org.createdAt?.toDate().toISOString() || new Date().toISOString(),
            };
        });
    } catch (e) {
        console.error("Could not fetch organizations for sitemap", e);
    }


  let newsUrls: any[] = [];
  try {
    const newsSnapshot = await getDocs(collection(firestore, 'student-org-updates'));
    newsUrls = newsSnapshot.docs.map((doc) => {
      const news = doc.data() as News;
      return {
        url: `${BASE_URL}/telebe-teskilatlari/yenilikler/${news.id}`,
        lastModified: news.updatedAt?.toDate().toISOString() || news.createdAt.toDate().toISOString(),
      };
    });
  } catch(e) {
    console.error("Could not fetch news for sitemap", e);
  }


  return [...routes, ...studentUrls, ...orgUrls, ...newsUrls];
}
