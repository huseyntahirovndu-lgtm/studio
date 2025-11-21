import { Student, Project, Achievement, Certificate, CategoryData, FacultyData, Organization, AppUser, Invitation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const FAKE_PASSWORDS: { [email: string]: string } = {
  'aysel@example.com': 'password123',
  'orxan@example.com': 'password123',
  'leyla@example.com': 'password123',
  'contact@techsolutions.com': 'password123',
  'startup@ndu.edu.az': 'password123',
  'admin@ndu.edu.az': 'adminpassword',
  'polad.elizade@example.com': 'password123',
  'shovket.elisoy@example.com': 'password123',
  'zeyneb.seyidli@example.com': 'password123'
};


// In-memory data store - Will be replaced by Firebase
let users: AppUser[] = [];
let projects: Project[] = [];
let achievements: Achievement[] = [];
let certificates: Certificate[] = [];
let categories: CategoryData[] = [];
let faculties: FacultyData[] = [
    { "id": "f-1", "name": "İqtisadiyyat və idarəetmə" },
    { "id": "f-2", "name": "Memarlıq və mühəndislik" },
    { "id": "f-3", "name": "Pedaqoji" },
    { "id": "f-4", "name": "Təbiətşünaslıq və kənd təsərrüfatı" },
    { "id": "f-5", "name": "Beynəlxalq Münasibətlər və hüquq" },
    { "id": "f-6", "name": "Tarix-filologiya" },
    { "id": "f-7", "name": "Fizika-Riyaziyyat" },
    { "id": "f-8", "name": "Xarici dillər" },
    { "id": "f-9", "name": "Tibb" },
    { "id": "f-10", "name": "İncəsənət" }
];
let invitations: Invitation[] = [];

// --- DATA ACCESS FUNCTIONS ---

// Return copies to avoid direct mutation from components
export const getUsers = (): AppUser[] => [...users];
export const getProjects = (): Project[] => [...projects];
export const getAchievements = (): Achievement[] => [...achievements];
export const getCertificates = (): Certificate[] => [...certificates];
export const getCategories = (): CategoryData[] => [...categories];
export const getFaculties = (): FacultyData[] => [...faculties];
export const getInvitations = (): Invitation[] => [...invitations];


export const getStudents = (): Student[] => {
  return users.filter(u => u.role === 'student') as Student[];
};

export const getOrganizations = (): Organization[] => {
  return users.filter(u => u.role === 'organization') as Organization[];
};

export const getStudentById = (id: string): Student | undefined => {
  const user = users.find(u => u.id === id && u.role === 'student');
  return user ? { ...user } as Student : undefined;
};

export const getOrganizationById = (id: string): Organization | undefined => {
  const user = users.find(u => u.id === id && u.role === 'organization');
  return user ? { ...user } as Organization : undefined;
};

export const getProjectById = (id: string): Project | undefined => {
    const project = projects.find(p => p.id === id);
    return project ? { ...project } : undefined;
}

export const getProjectsByIds = (ids: string[]): Project[] => {
    if (!ids) return [];
    return projects.filter(p => ids.includes(p.id)).map(p => ({...p}));
}

export const getProjectsByStudentId = (studentId: string): Project[] => {
  return projects.filter(p => p.studentId === studentId || (p.teamMemberIds || []).includes(studentId)).map(p => ({...p}));
};

export const getAchievementsByStudentId = (studentId: string): Achievement[] => {
  return achievements.filter(a => a.studentId === studentId).map(a => ({...a}));
};

export const getCertificatesByStudentId = (studentId: string): Certificate[] => {
  return certificates.filter(c => c.studentId === studentId).map(c => ({...c}));
};

export const getInvitationsByStudentId = (studentId: string): Invitation[] => {
    return invitations.filter(i => i.studentId === studentId).map(i => ({...i}));
}

export const getInvitationsByOrganizationId = (orgId: string): Invitation[] => {
    return invitations.filter(i => i.organizationId === orgId).map(i => ({...i}));
}


// --- DATA MUTATION FUNCTIONS ---
export const addUser = (user: AppUser, pass: string) => {
  users.push(user);
  FAKE_PASSWORDS[user.email] = pass;
};

export const updateUser = (user: AppUser): boolean => {
    const userIndex = users.findIndex(u => u.id === user.id);
    if(userIndex > -1) {
        users[userIndex] = user;
        return true;
    }
    return false;
};

export const deleteUser = (userId: string): boolean => {
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    // Also delete associated data if they are the owner
    projects = projects.filter(p => p.studentId !== userId);
    achievements = achievements.filter(a => a.studentId !== userId);
    certificates = certificates.filter(c => c.studentId !== userId);
    return users.length < initialLength;
}

export const addProject = (project: Project): void => {
  projects.push(project);
};

export const deleteProject = (projectId: string, ownerId: string): void => {
  projects = projects.filter(p => p.id !== projectId);
  const user = users.find(u => u.id === ownerId) as Student | Organization | undefined;
  if(user && 'projectIds' in user && user.projectIds){
    user.projectIds = user.projectIds.filter(id => id !== projectId);
  }
};

export const addAchievement = (achievement: Achievement): void => {
  achievements.push(achievement);
};

export const deleteAchievement = (achievementId: string, studentId: string): void => {
  achievements = achievements.filter(a => a.id !== achievementId);
   const user = users.find(u => u.id === studentId) as Student | undefined;
  if(user && user.achievementIds){
    user.achievementIds = user.achievementIds.filter(id => id !== achievementId);
  }
};

export const addCertificate = (certificate: Certificate): void => {
  certificates.push(certificate);
};

export const deleteCertificate = (certificateId: string, studentId: string): void => {
  certificates = certificates.filter(c => c.id !== certificateId);
   const user = users.find(u => u.id === studentId) as Student | undefined;
  if(user && user.certificateIds){
    user.certificateIds = user.certificateIds.filter(id => id !== certificateId);
  }
};


export const addCategory = (category: CategoryData) => {
    categories.push(category);
}

export const deleteCategory = (categoryId: string) => {
    categories = categories.filter(c => c.id !== categoryId);
}

export const addInvitation = (invitation: Invitation, projectId: string) => {
    invitations.push(invitation);
    const project = projects.find(p => p.id === projectId);
    if (project) {
        if(invitation.status === 'müraciət') {
            if (!project.applicantIds) project.applicantIds = [];
            project.applicantIds.push(invitation.studentId);
        } else {
             if (!project.invitedStudentIds) project.invitedStudentIds = [];
             project.invitedStudentIds.push(invitation.studentId);
        }
    }
}

export const updateInvitationStatus = (invitationId: string, status: 'qəbul edildi' | 'rədd edildi', studentId: string, projectId: string) => {
    const invitation = invitations.find(i => i.id === invitationId);
    if (invitation) {
        invitation.status = status;
        
        const project = projects.find(p => p.id === projectId);
        if(!project) return;

        // remove from applicant/invited lists
        if (project.applicantIds) {
            project.applicantIds = project.applicantIds.filter(id => id !== studentId);
        }
        if (project.invitedStudentIds) {
            project.invitedStudentIds = project.invitedStudentIds.filter(id => id !== studentId);
        }

        // if accepted, add to team
        if (status === 'qəbul edildi') {
            if (!project.teamMemberIds) {
                project.teamMemberIds = [];
            }
            project.teamMemberIds.push(studentId);
        }
    }
}

export const login = (email: string, pass: string): AppUser | null => {
    const foundUser = users.find(u => u.email === email);
    const storedPass = FAKE_PASSWORDS[email];

    if (foundUser && storedPass === pass) {
      return foundUser;
    }
    return null;
}