import { Student, Project, Achievement, Certificate, CategoryData, FacultyData, Organization, AppUser } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATA ---

export const faculties: FacultyData[] = [
    { id: 'f-1', name: 'İqtisadiyyat və idarəetmə' },
    { id: 'f-2', name: 'Memarlıq və mühəndislik' },
    { id: 'f-3', name: 'Tibb' },
    { id: 'f-4', name: 'Aqrar elmlər' },
    { id: 'f-5', name: 'Pedaqogika' },
    { id: 'f-6', name: 'Beynəlxalq münasibətlər və hüquq' },
    { id: 'f-7', name: 'İncəsənət' },
];

export const categories: CategoryData[] = [
    { id: 'c-1', name: 'STEM' },
    { id: 'c-2', name: 'Humanitar' },
    { id: 'c-3', name: 'İncəsənət' },
    { id: 'c-4', name: 'İdman' },
    { id: 'c-5', name: 'Sahibkarlıq' },
    { id: 'c-6', name: 'Texnologiya' },
];

let users: AppUser[] = [
  {
    id: 'student-1',
    role: 'student',
    firstName: 'Aysel',
    lastName: 'Məmmədova',
    email: 'aysel@example.com',
    faculty: 'Memarlıq və mühəndislik',
    major: 'Kompüter Mühəndisliyi',
    courseYear: 3,
    skills: ['React', 'Node.js', 'Firebase', 'UI/UX Design', 'Figma'],
    category: 'Texnologiya',
    talentScore: 92,
    projectIds: ['proj-1'],
    achievementIds: ['ach-1'],
    certificateIds: ['cert-1'],
    createdAt: new Date('2023-09-10T10:00:00Z'),
  },
  {
    id: 'student-2',
    role: 'student',
    firstName: 'Orxan',
    lastName: 'Əliyev',
    email: 'orxan@example.com',
    faculty: 'İqtisadiyyat və idarəetmə',
    major: 'Biznesin idarə edilməsi',
    courseYear: 4,
    skills: ['Marketinq', 'Analitika', 'Liderlik', 'Layihə İdarəçiliyi'],
    category: 'Sahibkarlıq',
    talentScore: 88,
    projectIds: [],
    achievementIds: [],
    certificateIds: [],
    createdAt: new Date('2023-10-05T14:30:00Z'),
  },
  {
    id: 'student-3',
    role: 'student',
    firstName: 'Leyla',
    lastName: 'Həsənova',
    email: 'leyla@example.com',
    faculty: 'İncəsənət',
    major: 'Qrafik Dizayn',
    courseYear: 2,
    skills: ['Adobe Photoshop', 'Illustrator', 'Brendinq', 'Veb Dizayn'],
    category: 'İncəsənət',
    talentScore: 95,
    projectIds: ['proj-2'],
    achievementIds: [],
    certificateIds: [],
    createdAt: new Date('2024-01-15T09:00:00Z'),
  },
   {
    id: 'org-1',
    role: 'organization',
    name: 'Tech Solutions LLC',
    companyName: 'Tech Solutions LLC',
    email: 'contact@techsolutions.com',
    sector: 'Texnologiya',
    savedStudentIds: ['student-1', 'student-3'],
    createdAt: new Date('2023-11-20T11:00:00Z'),
  }
];

let projects: Project[] = [
  { id: 'proj-1', studentId: 'student-1', title: 'Onlayn Ticarət Platforması', description: 'React və Node.js istifadə edərək e-ticarət saytının hazırlanması.', role: 'Full-Stack Developer', status: 'tamamlanıb', teamMembers: ['Aysel Məmmədova', 'Tural Abbasov'], link: 'https://github.com' },
  { id: 'proj-2', studentId: 'student-3', title: 'Brendinq Layihəsi', description: 'Yeni bir qəhvə markası üçün tam vizual kimliyin yaradılması.', role: 'Baş Dizayner', status: 'tamamlanıb', teamMembers: ['Leyla Həsənova'], link: 'https://behance.net' },
];

let achievements: Achievement[] = [
    { id: 'ach-1', studentId: 'student-1', name: 'Respublika İnformatika Olimpiadası', position: '1-ci yer', level: 'Respublika', date: '2023-05-15', description: 'Alqoritmik proqramlaşdırma üzrə respublika birinciliyi.' },
];

let certificates: Certificate[] = [
    { id: 'cert-1', studentId: 'student-1', name: 'Advanced React - Meta', certificateURL: 'https://coursera.org', level: 'Beynəlxalq' },
];


// --- DATA ACCESS FUNCTIONS ---

// Using functions to simulate async data fetching
export const getUsers = async (): Promise<AppUser[]> => {
  return Promise.resolve(users);
};

export const getStudents = async (): Promise<Student[]> => {
  return Promise.resolve(users.filter(u => u.role === 'student') as Student[]);
};
export const students = users.filter(u => u.role === 'student') as Student[];


export const getStudentById = async (id: string): Promise<Student | undefined> => {
  return Promise.resolve(users.find(u => u.id === id && u.role === 'student') as Student | undefined);
};

export const getOrganizationById = async (id: string): Promise<Organization | undefined> => {
    return Promise.resolve(users.find(u => u.id === id && u.role === 'organization') as Organization | undefined);
};

export const getUserByEmail = async (email: string): Promise<AppUser | undefined> => {
  return Promise.resolve(users.find(u => u.email === email));
};


export const getProjectsByStudentId = async (studentId: string): Promise<Project[]> => {
    return Promise.resolve(projects.filter(p => p.studentId === studentId));
};

export const getAchievementsByStudentId = async (studentId: string): Promise<Achievement[]> => {
    return Promise.resolve(achievements.filter(a => a.studentId === studentId));
};

export const getCertificatesByStudentId = async (studentId: string): Promise<Certificate[]> => {
    return Promise.resolve(certificates.filter(c => c.studentId === studentId));
};

// --- DATA MUTATION FUNCTIONS ---
export const addUser = async (user: AppUser): Promise<boolean> => {
  const existing = await getUserByEmail(user.email);
  if (existing) return false;
  users.push({ ...user, id: uuidv4(), createdAt: new Date() });
  return true;
};

export const updateUser = async (user: AppUser): Promise<boolean> => {
  const index = users.findIndex(u => u.id === user.id);
  if (index === -1) return false;
  users[index] = user;
  return true;
};

export const addProject = async (project: Project): Promise<void> => {
  projects.push(project);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  projects = projects.filter(p => p.id !== projectId);
};

export const addAchievement = async (achievement: Achievement): Promise<void> => {
  achievements.push(achievement);
};

export const deleteAchievement = async (achievementId: string): Promise<void> => {
  achievements = achievements.filter(a => a.id !== achievementId);
};

export const addCertificate = async (certificate: Certificate): Promise<void> => {
  certificates.push(certificate);
};

export const deleteCertificate = async (certificateId: string): Promise<void> => {
  certificates = certificates.filter(c => c.id !== certificateId);
};
