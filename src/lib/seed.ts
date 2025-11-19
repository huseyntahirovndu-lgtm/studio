'use client';

import {
  collection,
  doc,
  writeBatch,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import {
  Student,
  Project,
  Achievement,
  Certificate,
  CategoryData,
  FacultyData,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';


// --- MOCK DATA ---

const faculties: Omit<FacultyData, 'id'>[] = [
    { name: 'İqtisadiyyat və idarəetmə' },
    { name: 'Memarlıq və mühəndislik' },
    { name: 'Tibb' },
    { name: 'Aqrar elmlər' },
    { name: 'Pedaqogika' },
    { name: 'Beynəlxalq münasibətlər və hüquq' },
    { name: 'İncəsənət' },
];

const categories: Omit<CategoryData, 'id'>[] = [
    { name: 'STEM' },
    { name: 'Humanitar' },
    { name: 'İncəsənət' },
    { name: 'İdman' },
    { name: 'Sahibkarlıq' },
    { name: 'Texnologiya' },
];

const studentsData: Omit<Student, 'id' | 'role' | 'email' | 'createdAt' | 'talentScore'>[] = [
  {
    firstName: 'Aysel',
    lastName: 'Məmmədova',
    faculty: 'Memarlıq və mühəndislik',
    major: 'Kompüter Mühəndisliyi',
    courseYear: 3,
    skills: ['React', 'Node.js', 'Firebase', 'UI/UX Design', 'Figma'],
    category: 'Texnologiya',
  },
  {
    firstName: 'Orxan',
    lastName: 'Əliyev',
    faculty: 'İqtisadiyyat və idarəetmə',
    major: 'Biznesin idarə edilməsi',
    courseYear: 4,
    skills: ['Marketinq', 'Analitika', 'Liderlik', 'Layihə İdarəçiliyi'],
    category: 'Sahibkarlıq',
  },
  {
    firstName: 'Leyla',
    lastName: 'Həsənova',
    faculty: 'İncəsənət',
    major: 'Qrafik Dizayn',
    courseYear: 2,
    skills: ['Adobe Photoshop', 'Illustrator', 'Brendinq', 'Veb Dizayn'],
    category: 'İncəsənət',
  },
  {
    firstName: 'Kənan',
    lastName: 'İsmayılov',
    faculty: 'Tibb',
    major: 'Ümumi Tibb',
    courseYear: 5,
    skills: ['Tədqiqat', 'Anatomiya', 'Biokimya', 'Klinik Təcrübə'],
    category: 'STEM',
  },
   {
    firstName: 'Nərgiz',
    lastName: 'Quliyeva',
    faculty: 'Beynəlxalq münasibətlər və hüquq',
    major: 'Hüquqşünaslıq',
    courseYear: 3,
    skills: ['Mülki Hüquq', 'Cinayət Hüququ', 'Debat', 'Araşdırma'],
    category: 'Humanitar',
  },
  {
    firstName: 'Tural',
    lastName: 'Abbasov',
    faculty: 'Memarlıq və mühəndislik',
    major: 'İnformasiya Texnologiyaları',
    courseYear: 4,
    skills: ['Python', 'Data Science', 'Machine Learning', 'SQL'],
    category: 'Texnologiya',
  },
  {
    firstName: 'Fidan',
    lastName: 'Rəhimova',
    faculty: 'Pedaqogika',
    major: 'İbtidai təhsil',
    courseYear: 2,
    skills: ['Pedaqogika', 'Uşaq Psixologiyası', 'Kurikulum inkişafı'],
    category: 'Humanitar',
  },
  {
    firstName: 'Elvin',
    lastName: 'Bağırov',
    faculty: 'Aqrar elmlər',
    major: 'Aqronomluq',
    courseYear: 3,
    skills: ['Bitkiçilik', 'Torpaqşünaslıq', 'Aqrokimya'],
    category: 'STEM',
  },
  {
    firstName: 'Günel',
    lastName: 'Süleymanova',
    faculty: 'İncəsənət',
    major: 'Rəssamlıq',
    courseYear: 4,
    skills: ['Yağlı Boya', 'Akvarel', 'Heykəltəraşlıq', 'Rəqəmsal Rəsm'],
    category: 'İncəsənət',
  },
  {
    firstName: 'Rəşad',
    lastName: 'Hüseynov',
    faculty: 'İqtisadiyyat və idarəetmə',
    major: 'Maliyyə',
    courseYear: 3,
    skills: ['Mühasibat', 'İnvestisiya Analizi', 'Excel', 'Risk İdarəçiliyi'],
    category: 'Sahibkarlıq',
  },
];

const projectsData: Omit<Project, 'id' | 'studentId'>[] = [
  { title: 'Onlayn Ticarət Platforması', description: 'React və Node.js istifadə edərək e-ticarət saytının hazırlanması.', role: 'Full-Stack Developer', status: 'tamamlanıb', teamMembers: ['Aysel Məmmədova', 'Tural Abbasov'], link: 'https://github.com' },
  { title: 'Mobil Sağlamlıq Tətbiqi', description: 'Kardiomonitorinq üçün mobil tətbiq prototipi.', role: 'Tədqiqatçı', status: 'davam edir', teamMembers: ['Kənan İsmayılov'], link: 'https://github.com' },
  { title: 'Brendinq Layihəsi', description: 'Yeni bir qəhvə markası üçün tam vizual kimliyin yaradılması.', role: 'Baş Dizayner', status: 'tamamlanıb', teamMembers: ['Leyla Həsənova'], link: 'https://behance.net' },
];

const achievementsData: Omit<Achievement, 'id'| 'studentId'>[] = [
    { name: 'Respublika İnformatika Olimpiadası', position: '1-ci yer', level: 'Respublika', date: '2023-05-15', description: 'Alqoritmik proqramlaşdırma üzrə respublika birinciliyi.' },
    { name: 'Startup Fest', position: 'Ən Yaxşı Təqdimat', level: 'Regional', date: '2024-03-22', description: '“Ağıllı Kənd” layihəsinin təqdimatı.' },
];

const certificatesData: Omit<Certificate, 'id'|'studentId'>[] = [
    { name: 'Advanced React - Meta', certificateURL: 'https://coursera.org', level: 'Beynəlxalq' },
    { name: 'Introduction to Data Science', certificateURL: 'https://udemy.com', level: 'Beynəlxalq' },
];

// --- SEEDING FUNCTION ---

export const seedDatabase = async (firestore: Firestore) => {
    
  console.log('Seeding started...');
  const batch = writeBatch(firestore);

  // Check if seeding has already been done
  const facultiesCollection = collection(firestore, 'faculties');
  const facultiesSnapshot = await getDocs(facultiesCollection);
  if (!facultiesSnapshot.empty) {
    console.log('Database already seeded. Aborting.');
    return { success: false, message: 'Verilənlər bazası artıq nümunə məlumatlarla doldurulub.' };
  }

  try {
    // 1. Seed Faculties
    console.log('Seeding faculties...');
    faculties.forEach(faculty => {
      const docRef = doc(collection(firestore, 'faculties'), faculty.name.toLowerCase().replace(/ /g, '-'));
      batch.set(docRef, { ...faculty, id: docRef.id });
    });

    // 2. Seed Categories
    console.log('Seeding categories...');
    categories.forEach(category => {
      const docRef = doc(collection(firestore, 'categories'), category.name.toLowerCase().replace(/ /g, '-'));
      batch.set(docRef, { ...category, id: docRef.id });
    });

    // 3. Seed Students and their subcollections
    console.log('Seeding students...');
    for (const studentData of studentsData) {
      const studentId = uuidv4();
      const studentEmail = `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}@example.com`;
      const studentDocRef = doc(firestore, 'users', studentId);
      
      const newStudent: Student = {
        ...studentData,
        id: studentId,
        role: 'student',
        email: studentEmail,
        createdAt: new Date(),
        talentScore: Math.floor(Math.random() * 70) + 30, // Random score between 30-100
        projectIds: [],
        achievementIds: [],
        certificateIds: [],
      };

      // Add student
      batch.set(studentDocRef, newStudent);
      
      // Add a project to first student
      if (studentData.firstName === 'Aysel') {
        const project = projectsData[0];
        const projectRef = doc(collection(firestore, `users/${studentId}/projects`));
        batch.set(projectRef, {...project, studentId, id: projectRef.id });
      }

       // Add an achievement to first student
      if (studentData.firstName === 'Aysel') {
        const achievement = achievementsData[0];
        const achievementRef = doc(collection(firestore, `users/${studentId}/achievements`));
        batch.set(achievementRef, {...achievement, studentId, id: achievementRef.id });
      }

       // Add a certificate to first student
      if (studentData.firstName === 'Aysel') {
        const certificate = certificatesData[0];
        const certificateRef = doc(collection(firestore, `users/${studentId}/certificates`));
        batch.set(certificateRef, {...certificate, studentId, id: certificateRef.id });
      }
    }

    await batch.commit();
    console.log('Seeding successful!');
    return { success: true, message: 'Nümunə məlumatlar uğurla bazaya yerləşdirildi!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: `Xəta baş verdi: ${error}` };
  }
};
