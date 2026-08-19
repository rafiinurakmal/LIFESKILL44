import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Report } from '../types';
import { INITIAL_USERS, INITIAL_REPORTS } from '../data/initialData';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const USERS_COLLECTION = 'users';
const REPORTS_COLLECTION = 'reports';

/**
 * Seed initial data if database is brand new
 */
export async function seedInitialDataIfNeeded() {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (usersSnap.empty) {
      console.log('Seeding initial users to Firestore...');
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, USERS_COLLECTION, user.id), user);
      }
    }

    const reportsSnap = await getDocs(collection(db, REPORTS_COLLECTION));
    if (reportsSnap.empty) {
      console.log('Seeding initial reports to Firestore...');
      for (const report of INITIAL_REPORTS) {
        await setDoc(doc(db, REPORTS_COLLECTION, report.id), report);
      }
    }
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
  }
}

/**
 * Listen to real-time users list changes from Firestore
 */
export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((docSnap) => {
        users.push(docSnap.data() as User);
      });

      if (users.length === 0 && snapshot.metadata.fromCache === false) {
        onUpdate(INITIAL_USERS);
        seedInitialDataIfNeeded();
      } else if (users.length > 0) {
        onUpdate(users);
      }
    },
    (error) => {
      // Gracefully handle network offline / unavailable errors
      console.warn('Firestore users offline / sync notice:', error.message || error);
    }
  );
}

/**
 * Listen to real-time reports list changes from Firestore
 */
export function subscribeToReports(onUpdate: (reports: Report[]) => void) {
  const reportsRef = collection(db, REPORTS_COLLECTION);
  return onSnapshot(
    reportsRef,
    (snapshot) => {
      const reports: Report[] = [];
      snapshot.forEach((docSnap) => {
        reports.push(docSnap.data() as Report);
      });

      // Sort reports by date/id descending
      reports.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

      if (reports.length > 0) {
        onUpdate(reports);
      } else if (snapshot.metadata.fromCache === false) {
        seedInitialDataIfNeeded();
      }
    },
    (error) => {
      // Gracefully handle network offline / unavailable errors
      console.warn('Firestore reports offline / sync notice:', error.message || error);
    }
  );
}

/**
 * Clean object so that any undefined fields are removed (Firestore does not support undefined values)
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean;
}

/**
 * Save / update user in Firestore
 */
export async function saveUserToFirestore(user: User) {
  try {
    const cleanUser = sanitizeForFirestore(user);
    await setDoc(doc(db, USERS_COLLECTION, user.id), cleanUser, { merge: true });
    console.log('User saved to Firestore successfully:', user.id, user.name);
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
  }
}

/**
 * Save batch of users to Firestore efficiently (using writeBatch chunks up to 450 per batch)
 */
export async function saveUsersBatchToFirestore(usersList: User[]) {
  try {
    if (!usersList || usersList.length === 0) return;
    const CHUNK_SIZE = 400; // Firestore limit is 500 operations per batch
    for (let i = 0; i < usersList.length; i += CHUNK_SIZE) {
      const chunk = usersList.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach(u => {
        const clean = sanitizeForFirestore(u);
        const docRef = doc(db, USERS_COLLECTION, u.id);
        batch.set(docRef, clean, { merge: true });
      });
      await batch.commit();
    }
    console.log(`Successfully batch-saved ${usersList.length} users to Firestore.`);
  } catch (err) {
    console.error('Error batch saving users to Firestore:', err);
  }
}

/**
 * Delete user from Firestore
 */
export async function deleteUserFromFirestore(userId: string) {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (err) {
    console.error('Error deleting user from Firestore:', err);
  }
}

/**
 * Add a new report to Firestore
 */
export async function addReportToFirestore(report: Report) {
  try {
    const cleanReport = sanitizeForFirestore(report);
    await setDoc(doc(db, REPORTS_COLLECTION, report.id), cleanReport);
  } catch (err) {
    console.error('Error adding report to Firestore:', err);
  }
}

/**
 * Update an existing report in Firestore
 */
export async function updateReportInFirestore(report: Report) {
  try {
    const cleanReport = sanitizeForFirestore(report);
    await setDoc(doc(db, REPORTS_COLLECTION, report.id), cleanReport, { merge: true });
  } catch (err) {
    console.error('Error updating report in Firestore:', err);
  }
}

/**
 * Delete a report from Firestore
 */
export async function deleteReportFromFirestore(reportId: string) {
  try {
    await deleteDoc(doc(db, REPORTS_COLLECTION, reportId));
  } catch (err) {
    console.error('Error deleting report from Firestore:', err);
  }
}
