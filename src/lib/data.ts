import { Student, Project, Achievement, Certificate, CategoryData, FacultyData, Organization, AppUser, Invitation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATA ---

export let faculties: FacultyData[] = [
    { id: 'f-1', name: 'İqtisadiyyat və idarəetmə' },
    { id: 'f-2', name: 'Memarlıq və mühəndislik' },
    { id: 'f-3', name: 'Tibb' },
    { id: 'f-4', name: 'Aqrar elmlər' },
    { id: 'f-5', name: 'Pedaqogika' },
    { id: 'f-6', name: 'Beynəlxalq münasibətlər və hüquq' },
    { id: 'f-7', name: 'İncəsənət' },
];

export let categories: CategoryData[] = [
    { id: 'c-1', name: 'STEM' },
    { id: 'c-2', name: 'Humanitar' },
    { id: 'c-3', name: 'İncəsənət' },
    { id: 'c-4', name: 'İdman' },
    { id: 'c-5', name: 'Sahibkarlıq' },
    { id: 'c-6', name: 'Texnologiya' },
];

export let users: AppUser[] = [
  {
    id: 'student-1',
    role: 'student',
    firstName: 'Aysel',
    lastName: 'Məmmədova',
    email: 'aysel@example.com',
    faculty: 'Memarlıq və mühəndislik',
    major: 'Kompüter Mühəndisliyi',
    courseYear: 3,
    educationForm: 'Əyani',
    gpa: 92.5,
    skills: ['React', 'Node.js', 'Firebase', 'UI/UX Design', 'Figma'],
    category: 'Texnologiya',
    talentScore: 92,
    projectIds: ['proj-1'],
    achievementIds: ['ach-1'],
    certificateIds: ['cert-1'],
    linkedInURL: 'https://linkedin.com',
    githubURL: 'https://github.com',
    behanceURL: '',
    instagramURL: '',
    portfolioURL: '',
    createdAt: new Date('2023-09-10T10:00:00Z'),
    status: 'təsdiqlənmiş'
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
    educationForm: 'Əyani',
    gpa: 85.0,
    skills: ['Marketinq', 'Analitika', 'Liderlik', 'Layihə İdarəçiliyi'],
    category: 'Sahibkarlıq',
    talentScore: 88,
    projectIds: [],
    achievementIds: [],
    certificateIds: [],
    linkedInURL: 'https://linkedin.com',
    githubURL: 'https://github.com',
    behanceURL: '',
    instagramURL: '',
    portfolioURL: 'https://my-portfolio.com',
    createdAt: new Date('2023-10-05T14:30:00Z'),
    status: 'təsdiqlənmiş'
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
    educationForm: 'Qiyabi',
    gpa: 95.2,
    skills: ['Adobe Photoshop', 'Illustrator', 'Brendinq', 'Veb Dizayn'],
    category: 'İncəsənət',
    talentScore: 95,
    projectIds: ['proj-2'],
    achievementIds: [],
    certificateIds: [],
    linkedInURL: '',
    githubURL: '',
    behanceURL: 'https://behance.net',
    instagramURL: 'https://instagram.com',
    portfolioURL: '',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    status: 'gözləyir'
  },
   {
    id: 'org-1',
    role: 'organization',
    name: 'Tech Solutions LLC',
    companyName: 'Tech Solutions LLC',
    email: 'contact@techsolutions.com',
    sector: 'Texnologiya',
    savedStudentIds: ['student-1', 'student-3'],
    projectIds: ['org-proj-1'],
    createdAt: new Date('2023-11-20T11:00:00Z'),
  },
    {
    id: 'org-2',
    role: 'organization',
    name: 'NDU Startap Mərkəzi',
    companyName: 'NDU Startap Mərkəzi MMC',
    email: 'startup@ndu.edu.az',
    sector: 'İnnovasiya',
    savedStudentIds: ['student-2'],
    projectIds: ['org-proj-2'],
    createdAt: new Date('2024-02-01T11:00:00Z'),
  },
  {
    id: 'admin-1',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'İdarəçi',
    email: 'admin@ndu.edu.az',
    createdAt: new Date('2023-01-01T00:00:00Z'),
  }
];

let projects: Project[] = [
  { id: 'proj-1', studentId: 'student-1', title: 'Onlayn Ticarət Platforması', description: 'React və Node.js istifadə edərək e-ticarət saytının hazırlanması.', role: 'Full-Stack Developer', status: 'tamamlanıb', teamMembers: ['Aysel Məmmədova', 'Tural Abbasov'], link: 'https://github.com' },
  { id: 'proj-2', studentId: 'student-3', title: 'Brendinq Layihəsi', description: 'Yeni bir qəhvə markası üçün tam vizual kimliyin yaradılması.', role: 'Baş Dizayner', status: 'tamamlanıb', teamMembers: ['Leyla Həsənova'], link: 'https://behance.net' },
  { id: 'org-proj-1', studentId: 'org-1', title: 'Mobil Tətbiq 2.0', description: 'Mövcud mobil tətbiqin yenidən işlənməsi.', role: 'Təşkilat Layihəsi', status: 'davam edir', teamMemberIds: [], invitedStudentIds: [] },
  { id: 'org-proj-2', studentId: 'org-2', title: 'İnnovasiya Həftəsi', description: 'Universitet daxili innovasiya yarışmasının təşkili.', role: 'Təşkilat Layihəsi', status: 'davam edir', teamMemberIds: [], invitedStudentIds: [] },
];

let achievements: Achievement[] = [
    { id: 'ach-1', studentId: 'student-1', name: 'Respublika İnformatika Olimpiadası', position: '1-ci yer', level: 'Respublika', date: '2023-05-15', description: 'Alqoritmik proqramlaşdırma üzrə respublika birinciliyi.' },
];

let certificates: Certificate[] = [
    { id: 'cert-1', studentId: 'student-1', name: 'Advanced React - Meta', certificateURL: 'https://coursera.org', level: 'Beynəlxalq' },
];

let invitations: Invitation[] = [];


// --- DATA ACCESS FUNCTIONS ---

// Using functions to simulate async data fetching
export const getUsers = (): AppUser[] => {
  return users;
};

export const getStudents = (): Student[] => {
  return users.filter(u => u.role === 'student') as Student[];
};

export const getOrganizations = (): Organization[] => {
  return users.filter(u => u.role === 'organization') as Organization[];
};

export const getStudentById = async (id: string): Promise<Student | undefined> => {
  return users.find(u => u.id === id && u.role === 'student') as Student | undefined;
};

export const getOrganizationById = async (id: string): Promise<Organization | undefined> => {
    return users.find(u => u.id === id && u.role === 'organization') as Organization | undefined;
};

export const getUserByEmail = async (email: string): Promise<AppUser | undefined> => {
  return users.find(u => u.email === email);
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    return projects.find(p => p.id === id);
}

export const getProjectsByIds = async (ids: string[]): Promise<Project[]> => {
    return projects.filter(p => ids.includes(p.id));
}

export const getProjectsByStudentId = async (studentId: string): Promise<Project[]> => {
    return projects.filter(p => p.studentId === studentId);
};

export const getAchievementsByStudentId = async (studentId: string): Promise<Achievement[]> => {
    return achievements.filter(a => a.studentId === studentId);
};

export const getCertificatesByStudentId = async (studentId: string): Promise<Certificate[]> => {
    return certificates.filter(c => c.studentId === studentId);
};

export const getInvitationsByStudentId = async (studentId: string): Promise<Invitation[]> => {
    return invitations.filter(i => i.studentId === studentId);
}


// --- DATA MUTATION FUNCTIONS ---
export const addUser = (user: AppUser) => {
  users.push(user);
};

export const updateUser = (user: AppUser): boolean => {
  const index = users.findIndex(u => u.id === user.id);
  if (index === -1) return false;
  users[index] = user;
  return true;
};

export const deleteUser = (userId: string): boolean => {
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    return users.length < initialLength;
}

export const addProject = (project: Project): void => {
  projects.push(project);
};

export const deleteProject = (projectId: string): void => {
  projects = projects.filter(p => p.id !== projectId);
};

export const addAchievement = (achievement: Achievement): void => {
  achievements.push(achievement);
};

export const deleteAchievement = (achievementId: string): void => {
  achievements = achievements.filter(a => a.id !== achievementId);
};

export const addCertificate = (certificate: Certificate): void => {
  certificates.push(certificate);
};

export const deleteCertificate = (certificateId: string): void => {
  certificates = certificates.filter(c => c.id !== certificateId);
};


export const addCategory = (category: CategoryData) => {
    categories.push(category);
}

export const deleteCategory = (categoryId: string) => {
    categories = categories.filter(c => c.id !== categoryId);
}

export const addInvitation = (invitation: Invitation, projectId: string) => {
  invitations.push(invitation);
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex !== -1) {
    const project = projects[projectIndex];
    project.invitedStudentIds = [...(project.invitedStudentIds || []), invitation.studentId];
  }
}

export const updateInvitationStatus = (invitationId: string, status: 'qəbul edildi' | 'rədd edildi', studentId: string, projectId: string) => {
    const invIndex = invitations.findIndex(i => i.id === invitationId);
    if(invIndex !== -1) {
        invitations[invIndex].status = status;
    }

    if (status === 'qəbul edildi') {
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if(projectIndex !== -1) {
            const project = projects[projectIndex];
            project.teamMemberIds = [...(project.teamMemberIds || []), studentId];
            project.invitedStudentIds = project.invitedStudentIds?.filter(id => id !== studentId);
        }
    }
}
