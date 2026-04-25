import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "entries";

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateStr(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date at midnight local time
 */
export function parseDateStr(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Add a new entry to Firestore
 */
export async function addEntry(userId, { date, generated, consumed }) {
  const dateObj = parseDateStr(date);
  const docRef = await addDoc(collection(db, COLLECTION), {
    date: Timestamp.fromDate(dateObj),
    dateStr: date,
    generated: parseFloat(generated),
    consumed: parseFloat(consumed),
    createdBy: userId,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Update an existing entry
 */
export async function updateEntry(entryId, { date, generated, consumed }) {
  const dateObj = parseDateStr(date);
  const docRef = doc(db, COLLECTION, entryId);
  await updateDoc(docRef, {
    date: Timestamp.fromDate(dateObj),
    dateStr: date,
    generated: parseFloat(generated),
    consumed: parseFloat(consumed),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete an entry
 */
export async function deleteEntry(entryId) {
  const docRef = doc(db, COLLECTION, entryId);
  await deleteDoc(docRef);
}

/**
 * Get all entries for a user, sorted by date descending
 */
export async function getEntries(userId) {
  const q = query(
    collection(db, COLLECTION),
    where("createdBy", "==", userId),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
  }));
}

/**
 * Get the last N entries for a user
 */
export async function getRecentEntries(userId, count = 7) {
  const q = query(
    collection(db, COLLECTION),
    where("createdBy", "==", userId),
    orderBy("date", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
  }));
}

/**
 * Get previous entry (for comparison warnings)
 */
export async function getPreviousEntry(userId) {
  const q = query(
    collection(db, COLLECTION),
    where("createdBy", "==", userId),
    orderBy("date", "desc"),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
  };
}

/**
 * Check if an entry exists for a specific date
 */
export async function getEntryByDate(userId, dateStr) {
  const q = query(
    collection(db, COLLECTION),
    where("createdBy", "==", userId),
    where("dateStr", "==", dateStr)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
  };
}
