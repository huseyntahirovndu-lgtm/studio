export type Category =
  | 'STEM'
  | 'Humanitar'
  | 'İncəsənət'
  | 'İdman'
  | 'Sahibkarlıq'
  | 'Texnologiya';

export type Faculty = string;

export type AchievementLevel =
  | 'Beynəlxalq'
  | 'Respublika'
  | 'Regional'
  | 'Universitet';
  
export type CertificateLevel =
  | 'Beynəlxalq'
  | 'Respublika'
  | 'Regional'
  | 'Universitet';

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  role: string;
  link?: string;
  mediaLink?: string;
  teamMembers?: string[];
  status: 'davam edir' | 'tamamlanıb';
}

export interface Achievement {
  id: string;
  studentId: string;
  name: string;
  description?: string;
  position: string;
  date: string; // ISO 8601 format
  level: AchievementLevel;
  link?: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  name: string;
  certificateURL: string;
  level: CertificateLevel;
}

export type UserRole = 'student' | 'organization' | 'admin';

export interface BaseUser {
    id: string;
    role: UserRole;
    email: string;
    createdAt?: any;
}


export interface Student extends BaseUser {
  role: 'student';
  firstName: string;
  lastName: string;
  faculty: string;
  major: string;
  courseYear: number;
  educationForm?: string;
  gpa?: number;
  skills: string[];
  category: string;
  projectIds?: string[];
  achievementIds?: string[];
  certificateIds?: string[];
  linkedInURL?: string;
  githubURL?: string;
  behanceURL?: string;
  instagramURL?: string;
  portfolioURL?: string;
  talentScore?: number;
  profilePictureUrl?: string;
  profilePictureHint?: string;
}

export interface Organization extends BaseUser {
    role: 'organization';
    name: string;
    companyName: string;
    sector: string;
    savedStudentIds: string[];
}

export interface Admin extends BaseUser {
    role: 'admin';
    firstName: string;
    lastName: string;
}

export interface FacultyData {
    id: string;
    name: string;
}

export interface CategoryData {
    id: string;
    name: string;
}

export type AppUser = Student | Organization | Admin;
