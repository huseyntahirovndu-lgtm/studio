import { Student, Project, Achievement, Certificate, CategoryData, FacultyData, Organization, AppUser, Invitation } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import fullData from './istadad-merkezi.json';

// In-memory data store
let users: AppUser[] = [...fullData.users];
let projects: Project[] = [...fullData.projects];
let achievements: Achievement[] = [...fullData.achievements];
let certificates: Certificate[] = [...fullData.certificates];
let categories: CategoryData[] = [...fullData.categories];
let faculties: FacultyData[] = [...fullData.faculties];
let invitations: Invitation[] = [...fullData.invitations];

// --- DATA ACCESS FUNCTIONS ---

export { users, projects, achievements, certificates, categories, faculties, invitations };

export const getStudents = (): Student[] => {
  return users.filter(u => u.role === 'student') as Student[];
};

export const getOrganizations = (): Organization[] => {
  return users.filter(u => u.role === 'organization') as Organization[];
};

export const getStudentById = (id: string): Student | undefined => {
  return users.find(u => u.id === id && u.role === 'student') as Student | undefined;
};

export const getOrganizationById = (id: string): Organization | undefined => {
  return users.find(u => u.id === id && u.role === 'organization') as Organization | undefined;
};

export const getProjectById = (id: string): Project | undefined => {
    return projects.find(p => p.id === id);
}

export const getProjects = (): Project[] => {
    return projects;
}
export const getCertificates = (): Certificate[] => {
    return certificates;
}

export const getProjectsByIds = (ids: string[]): Project[] => {
    if (!ids) return [];
    return projects.filter(p => ids.includes(p.id));
}

export const getProjectsByStudentId = (studentId: string): Project[] => {
  return projects.filter(p => p.studentId === studentId);
};

export const getAchievementsByStudentId = (studentId: string): Achievement[] => {
  return achievements.filter(a => a.studentId === studentId);
};

export const getCertificatesByStudentId = (studentId: string): Certificate[] => {
  return certificates.filter(c => c.studentId === studentId);
};

export const getInvitationsByStudentId = (studentId: string): Invitation[] => {
    return invitations.filter(i => i.studentId === studentId);
}

// --- DATA MUTATION FUNCTIONS ---
export const addUser = (user: AppUser) => {
  users.push(user);
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
    return users.length < initialLength;
}

export const addProject = (project: Project): void => {
  projects.push(project);
};

export const deleteProject = (projectId: string, studentId: string): void => {
  projects = projects.filter(p => p.id !== projectId);
  const user = getStudentById(studentId);
  if(user && user.projectIds){
    user.projectIds = user.projectIds.filter(id => id !== projectId);
    updateUser(user);
  }
};

export const addAchievement = (achievement: Achievement): void => {
  achievements.push(achievement);
};

export const deleteAchievement = (achievementId: string, studentId: string): void => {
  achievements = achievements.filter(a => a.id !== achievementId);
   const user = getStudentById(studentId);
  if(user && user.achievementIds){
    user.achievementIds = user.achievementIds.filter(id => id !== achievementId);
    updateUser(user);
  }
};

export const addCertificate = (certificate: Certificate): void => {
  certificates.push(certificate);
};

export const deleteCertificate = (certificateId: string, studentId: string): void => {
  certificates = certificates.filter(c => c.id !== certificateId);
   const user = getStudentById(studentId);
  if(user && user.certificateIds){
    user.certificateIds = user.certificateIds.filter(id => id !== certificateId);
    updateUser(user);
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
    const project = getProjectById(projectId);
    if (project) {
        if (!project.invitedStudentIds) {
            project.invitedStudentIds = [];
        }
        project.invitedStudentIds.push(invitation.studentId);
    }
}

export const updateInvitationStatus = (invitationId: string, status: 'qəbul edildi' | 'rədd edildi', studentId: string, projectId: string) => {
    const invitation = invitations.find(i => i.id === invitationId);
    if (invitation) {
        invitation.status = status;
        if (status === 'qəbul edildi') {
            const project = getProjectById(projectId);
            if (project) {
                if (!project.teamMemberIds) {
                    project.teamMemberIds = [];
                }
                project.teamMemberIds.push(studentId);
                // remove from invited
                if (project.invitedStudentIds) {
                    project.invitedStudentIds = project.invitedStudentIds.filter(id => id !== studentId);
                }
            }
        }
    }
}
