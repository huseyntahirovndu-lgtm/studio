export type Category =
  | 'STEM'
  | 'Humanitar'
  | 'İncəsənət'
  | 'İdman'
  | 'Sahibkarlıq'
  | 'Texnologiya';

export type Faculty =
  | 'İqtisadiyyat və İdarəetmə'
  | 'Mühəndislik'
  | 'Tibb'
  | 'Memarlıq'
  | 'Pedaqoji'
  | 'Sosial İdarəetmə və Hüquq'
  | 'Beynəlxalq Münasibətlər və Xarici Dillər'
  | 'İncəsənət';

export type AchievementLevel =
  | 'Beynəlxalq'
  | 'Respublika'
  | 'Regional'
  | 'Universitet';

export interface Project {
  title: string;
  description: string;
  role: string;
  link?: string;
  imageUrl?: string;
}

export interface Achievement {
  name: string;
  position: string;
  date: string;
  level: AchievementLevel;
}

export interface Student {
  id: string;
  name: string;
  surname: string;
  faculty: Faculty;
  major: string;
  course: number;
  profilePictureUrl: string;
  profilePictureHint: string;
  skills: string[];
  mainCategory: Category;
  projects: Project[];
  achievements: Achievement[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    behance?: string;
    instagram?: string;
    portfolio?: string;
  };
  talentScore: number;
  joinDate: string; // ISO 8601 format
}
