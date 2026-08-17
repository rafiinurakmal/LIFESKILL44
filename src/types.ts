export type UserRole = 'student' | 'teacher' | 'admin';
export type UserStatus = 'approved' | 'pending' | 'rejected';

export type KategoriCapaian = 'Belum Dinilai' | 'BB' | 'MB' | 'BSH' | 'SAB';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  className?: string; // e.g. "" for students
  nisNip?: string;    // NIS for student, NIP for teacher
  avatar?: string;
  phone?: string;
  status?: UserStatus;
  createdAt?: string;
  password?: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  actor: string;
  date: string; // ISO or formatted date string
  note: string;
  type?: 'submit' | 'update' | 'grade' | 'comment';
}

export interface Report {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  nis: string;
  email: string;
  day: string;          // e.g. "Sabtu"
  date: string;         // e.g. "2026-07-18"
  meeting: number;      // e.g. 2
  title: string;
  notes: string;
  result: string;
  reflection: string;   // Pupil reflection choice
  category: KategoriCapaian;
  feedback: string;
  gradedBy?: string;
  gradedAt?: string;
  photos: string[];     // Data URLs or photo links
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ReflectionOption {
  id: string;
  label: string;
  description: string;
  iconName: string;
}
