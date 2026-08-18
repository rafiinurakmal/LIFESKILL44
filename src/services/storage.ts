import { User, Report } from '../types';
import { INITIAL_USERS, INITIAL_REPORTS } from '../data/initialData';
import {
  addReportToFirestore,
  updateReportInFirestore,
  deleteReportFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore
} from '../lib/firebase';

const USERS_KEY = 'alazhar_lifeskill_users_v3';
const REPORTS_KEY = 'alazhar_lifeskill_reports_v3';
const CURRENT_USER_KEY = 'alazhar_lifeskill_current_user_v3';
const IS_LOGGED_IN_KEY = 'alazhar_lifeskill_is_logged_in_v3';

export function getIsLoggedIn(): boolean {
  try {
    return localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setIsLoggedIn(loggedIn: boolean): void {
  try {
    localStorage.setItem(IS_LOGGED_IN_KEY, loggedIn ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function logoutUser(): void {
  try {
    localStorage.setItem(IS_LOGGED_IN_KEY, 'false');
  } catch {
    // ignore
  }
}

export function getUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed: User[] = JSON.parse(data);
    
    // Ensure admin user exists
    const hasAdmin = parsed.some(u => u.role === 'admin' || u.id === 'u_admin_1');
    if (!hasAdmin) {
      parsed.unshift(INITIAL_USERS[0]);
    }

    const sanitized = parsed.map(u => {
      let newU = { ...u };
      if (!newU.status) {
        newU.status = 'approved' as const;
      }
      if (!newU.password) {
        newU.password = '123456';
      }
      return newU;
    });

    return sanitized;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  users.forEach(u => {
    saveUserToFirestore(u);
  });
}

export function addUser(newUser: User): User[] {
  const current = getUsers();
  // Filter out any duplicate with same ID or Email
  const filtered = current.filter(u => u.id !== newUser.id && u.email.toLowerCase() !== newUser.email.toLowerCase());
  const updated = [...filtered, newUser];
  saveUsers(updated);
  return updated;
}

export function addUsersBatch(newUsers: User[]): { updatedUsers: User[]; addedCount: number; updatedCount: number } {
  const current = getUsers();
  const userMap = new Map<string, User>();
  
  // Seed existing users by email lowercased
  current.forEach(u => {
    userMap.set(u.email.toLowerCase(), u);
  });

  let addedCount = 0;
  let updatedCount = 0;

  newUsers.forEach(newUser => {
    const key = newUser.email.toLowerCase();
    if (userMap.has(key)) {
      // Merge/update
      const existing = userMap.get(key)!;
      userMap.set(key, {
        ...existing,
        name: newUser.name || existing.name,
        role: newUser.role || existing.role,
        className: newUser.className || existing.className,
        nisNip: newUser.nisNip || existing.nisNip,
        status: newUser.status || existing.status || 'approved',
        password: newUser.password || existing.password || '123456'
      });
      updatedCount++;
    } else {
      userMap.set(key, newUser);
      addedCount++;
    }
  });

  const updatedUsers = Array.from(userMap.values());
  saveUsers(updatedUsers);
  return { updatedUsers, addedCount, updatedCount };
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  deleteUserFromFirestore(userId);
}

export function getCurrentUser(): User {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const allUsers = getUsers();
      const matched = allUsers.find(u => u.id === parsed.id);
      if (matched) return matched;
    }
  } catch {
    // fallback
  }
  const users = getUsers();
  const defaultUser = users.find(u => u.role === 'admin') || users[0] || INITIAL_USERS[0];
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function updateUserProfile(updatedUser: User): User {
  const users = getUsers();
  const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
  saveUsers(updatedUsers);
  setCurrentUser(updatedUser);
  saveUserToFirestore(updatedUser);
  return updatedUser;
}

export function getReports(): Report[] {
  try {
    const data = localStorage.getItem(REPORTS_KEY);
    if (!data) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_REPORTS;
  }
}

export function saveReports(reports: Report[]): void {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function addReport(newReport: Report): Report[] {
  const reports = getReports();
  const updated = [newReport, ...reports];
  saveReports(updated);
  addReportToFirestore(newReport);
  return updated;
}

export function updateReport(updatedReport: Report): Report[] {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === updatedReport.id);
  if (index !== -1) {
    reports[index] = updatedReport;
    saveReports([...reports]);
  }
  updateReportInFirestore(updatedReport);
  return getReports();
}

export function deleteReport(id: string): Report[] {
  const reports = getReports().filter(r => r.id !== id);
  saveReports(reports);
  deleteReportFromFirestore(id);
  return reports;
}

export function resetToDefaults(): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
}

