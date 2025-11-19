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

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  role: string;
  link?: string;
  mediaLink?: string;
  teamMembers?: string[];
  status?: 'davam edir' | 'tamamlanıb';
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
  certificateURL: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
  createdAt?: any; // Allow serverTimestamp
}

    