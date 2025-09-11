'use server';

import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Hotel } from '@/lib/types';

// Since Firestore returns Timestamps, we need a type for the data from the DB
type HotelDataFromFirestore = Omit<Hotel, 'createdAt'> & {
  createdAt: Timestamp;
};

// Helper to convert Firestore data to our app's Hotel type
function toHotel(
  snapshot:
    | firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>
    | firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
): Hotel {
  const data = snapshot.data() as HotelDataFromFirestore;
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt.toDate(),
  };
}

export async function getHotels(): Promise<Hotel[]> {
  const querySnapshot = await getDocs(collection(db, 'hotels'));
  if (querySnapshot.empty) {
    return [];
  }
  return querySnapshot.docs.map(toHotel);
}

export async function getHotel(id: string): Promise<Hotel | null> {
  const docRef = doc(db, 'hotels', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return toHotel(docSnap);
}

export async function createHotel(
  hotel: Omit<Hotel, 'id' | 'createdAt'>
): Promise<Hotel> {
  const docRef = await addDoc(collection(db, 'hotels'), {
    ...hotel,
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...hotel,
    createdAt: new Date(),
  };
}

export async function updateHotel(
  id: string,
  hotel: Partial<Omit<Hotel, 'id'>>
): Promise<void> {
  const docRef = doc(db, 'hotels', id);
  await updateDoc(docRef, hotel);
}

export async function deleteHotel(id: string): Promise<void> {
  const docRef = doc(db, 'hotels', id);
  await deleteDoc(docRef);
}
