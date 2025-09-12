

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
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Hotel, Booking } from '@/lib/types';
import type { DocumentSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';


// Since Firestore returns Timestamps, we need a type for the data from the DB
type HotelDataFromFirestore = Omit<Hotel, 'createdAt'> & {
  createdAt: Timestamp;
};

// Helper to convert Firestore data to our app's Hotel type
function toHotel(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
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
  hotel: Omit<Hotel, 'id' | 'createdAt' | 'logoUrl'>,
  logo?: File
): Promise<Hotel> {
  const docRef = await addDoc(collection(db, 'hotels'), {
    ...hotel,
    createdAt: Timestamp.now(),
  });

  let logoUrl: string | undefined = undefined;
  if (logo) {
    const storageRef = ref(storage, `hotel-logos/${docRef.id}/${logo.name}`);
    await uploadBytes(storageRef, logo);
    logoUrl = await getDownloadURL(storageRef);
    await updateDoc(docRef, { logoUrl });
  }

  const newHotelData = (await getDoc(docRef)).data() as HotelDataFromFirestore;

  return {
    id: docRef.id,
    ...newHotelData,
    createdAt: newHotelData.createdAt.toDate(),
    logoUrl,
  };
}

export async function updateHotel(
  id: string,
  hotel: Partial<Omit<Hotel, 'id'>>,
  newLogo?: File
): Promise<Hotel> {
  const docRef = doc(db, 'hotels', id);
  
  // Handle logo update
  if (newLogo) {
     const currentHotel = await getHotel(id);
     if(currentHotel?.logoUrl) {
        // Delete old logo if it exists
        const oldLogoRef = ref(storage, currentHotel.logoUrl);
        try {
            await deleteObject(oldLogoRef);
        } catch (error: any) {
             if (error.code !== 'storage/object-not-found') {
                console.error("Could not delete old logo:", error);
             }
        }
     }
    const storageRef = ref(storage, `hotel-logos/${id}/${newLogo.name}`);
    await uploadBytes(storageRef, newLogo);
    hotel.logoUrl = await getDownloadURL(storageRef);
  }

  await updateDoc(docRef, hotel);
  
  const updatedDoc = await getDoc(docRef);
  return toHotel(updatedDoc);
}


export async function deleteHotel(id: string): Promise<void> {
  const docRef = doc(db, 'hotels', id);
  await deleteDoc(docRef);
  // Optionally: delete associated files in storage
  const logoRef = ref(storage, `hotel-logos/${id}`);
  try {
    // This is a simplified deletion. For a real app, you'd list all files in the folder and delete them.
  } catch (error) {
    console.error("Error deleting hotel storage folder:", error);
  }
}

// --- Booking Service Functions ---

type BookingFromFirestore = Omit<Booking, 'checkIn' | 'checkOut' | 'lastChanged'> & {
    checkIn: Timestamp;
    checkOut: Timestamp;
    lastChanged: Timestamp;
};

function toBooking(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Booking {
    const data = doc.data() as BookingFromFirestore;
    return {
        id: doc.id,
        ...data,
        checkIn: data.checkIn.toDate(),
        checkOut: data.checkOut.toDate(),
        lastChanged: data.lastChanged.toDate(),
    } as Booking;
}

export async function getBookingsForHotel(hotelId: string): Promise<Booking[]> {
    const bookingsCol = collection(db, 'hotels', hotelId, 'bookings');
    const q = query(bookingsCol); // Add ordering later, e.g., orderBy('checkIn', 'desc')
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return [];
    }

    return querySnapshot.docs.map(toBooking);
}

export async function getBooking(hotelId: string, bookingId: string): Promise<Booking | null> {
    const docRef = doc(db, 'hotels', hotelId, 'bookings', bookingId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
    return toBooking(docSnap);
}


export async function createBooking(hotelId: string, booking: Omit<Booking, 'id' | 'lastChanged'>): Promise<Booking> {
    const bookingsCol = collection(db, 'hotels', hotelId, 'bookings');
    const newBookingData = {
        ...booking,
        hotelId: hotelId, // Ensure hotelId is saved in the document
        checkIn: Timestamp.fromDate(new Date(booking.checkIn)),
        checkOut: Timestamp.fromDate(new Date(booking.checkOut)),
        lastChanged: Timestamp.now(),
    };
    const docRef = await addDoc(bookingsCol, newBookingData);
    
    const createdBooking = await getBooking(hotelId, docRef.id);
    if (!createdBooking) {
      throw new Error("Failed to create and retrieve booking.");
    }
    return createdBooking;
}
