import { Student, Project, Achievement, Certificate, CategoryData, FacultyData, Organization, AppUser, Invitation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// This file now only contains static data that is not expected to change frequently.
// All dynamic data like users, projects, etc., will be fetched from Firestore.

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


// --- MOCK DATA FUNCTIONS - TO BE REPLACED WITH FIRESTORE CALLS ---

// These functions are now placeholders. The actual implementation will be in a new firebase-data.ts file
// or directly within the components using hooks.

export const getStudents = (): Student[] => {
  return []; // This will be fetched from Firestore
};

export const getOrganizations = (): Organization[] => {
  return []; // This will be fetched from Firestore
};

export const getStudentById = async (id: string): Promise<Student | undefined> => {
  return undefined; // This will be fetched from Firestore
};

export const getOrganizationById = async (id: string): Promise<Organization | undefined> => {
    return undefined; // This will be fetched from Firestore
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    return undefined;
}

export const getProjectsByIds = async (ids: string[]): Promise<Project[]> => {
    return [];
}

export const getProjectsByStudentId = async (studentId: string): Promise<Project[]> => {
    return [];
};

export const getAchievementsByStudentId = async (studentId: string): Promise<Achievement[]> => {
    return [];
};

export const getCertificatesByStudentId = async (studentId: string): Promise<Certificate[]> => {
    return [];
};

export const getInvitationsByStudentId = async (studentId: string): Promise<Invitation[]> => {
    return [];
}


// --- DATA MUTATION FUNCTIONS - TO BE REPLACED ---
export const addUser = (user: AppUser) => {
  // Placeholder
};

export const updateUser = (user: AppUser): boolean => {
    // Placeholder
    return true;
};

export const deleteUser = (userId: string): boolean => {
    // Placeholder
    return true;
}

export const addProject = (project: Project): void => {
  // Placeholder
};

export const deleteProject = (projectId: string): void => {
  // Placeholder
};

export const addAchievement = (achievement: Achievement): void => {
  // Placeholder
};

export const deleteAchievement = (achievementId: string): void => {
  // Placeholder
};

export const addCertificate = (certificate: Certificate): void => {
  // Placeholder
};

export const deleteCertificate = (certificateId: string): void => {
  // Placeholder
};


export const addCategory = (category: CategoryData) => {
    // Placeholder
}

export const deleteCategory = (categoryId: string) => {
    // Placeholder
}

export const addInvitation = (invitation: Invitation, projectId: string) => {
    // Placeholder
}

export const updateInvitationStatus = (invitationId: string, status: 'qəbul edildi' | 'rədd edildi', studentId: string, projectId: string) => {
    // Placeholder
}
