

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
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Hotel, Booking, Guest } from '@/lib/types';
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
  hotelData: Omit<Hotel, 'id' | 'createdAt' | 'logoUrl'>,
  logo?: File
): Promise<Hotel> {
  let logoUrl: string | undefined = undefined;
  const tempIdForUpload = `temp_${Date.now()}`;

  // Step 1: Attempt to upload logo first.
  // This is to ensure we don't create a DB entry if the upload fails.
  if (logo && logo.size > 0) {
    try {
      // Use a temporary or predictable ID for the path before the doc exists
      const storageRef = ref(storage, `hotel-logos/${tempIdForUpload}/${logo.name}`);
      await uploadBytes(storageRef, logo);
      logoUrl = await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Firebase Storage Error during logo upload:", error);
      // Re-throw the error to be caught by the frontend, preventing DB creation.
      throw error;
    }
  }

  // Step 2: If logo upload is successful (or no logo), create the Firestore document.
  const docRef = await addDoc(collection(db, 'hotels'), {
    ...hotelData,
    logoUrl: logoUrl, // Add the logoUrl here
    createdAt: Timestamp.now(),
  });

  // Optional: If we used a temporary path for the logo, we could rename it to the final docRef.id
  // For simplicity, we'll leave it as is. A more robust solution might handle this.

  // Step 3: Fetch the final state of the document and return it.
  const newHotelDoc = await getDoc(docRef);
  return toHotel(newHotelDoc);
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


export async function deleteHotel(hotelId: string): Promise<void> {
  const hotelRef = doc(db, 'hotels', hotelId);
  const hotel = await getHotel(hotelId);

  // 1. Delete all bookings associated with the hotel and their storage files
  const bookings = await getBookingsForHotel(hotelId);
  for (const booking of bookings) {
    if (booking.id) {
      await deleteBooking(hotelId, booking.id);
    }
  }

  // 2. Delete hotel logo from storage
  if (hotel?.logoUrl) {
    try {
      const logoStorageRef = ref(storage, hotel.logoUrl);
      await deleteObject(logoStorageRef);
    } catch (error: any) {
      // If the object doesn't exist or we don't have permission,
      // we can ignore the error and proceed with deleting the DB entry.
      if (error.code !== 'storage/object-not-found') {
        console.warn(`Could not delete hotel logo, proceeding with db delete:`, error.code);
      }
    }
  }

  // 3. Delete the hotel document from Firestore
  await deleteDoc(hotelRef);
}

// --- Booking Service Functions ---

type BookingFromFirestore = Omit<Booking, 'checkIn' | 'checkOut' | 'lastChanged'> & {
    checkIn: Timestamp;
    checkOut: Timestamp;
    lastChanged: Timestamp;
};

function toBooking(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Booking {
    const data = doc.data() as BookingFromFirestore;
    const booking: Booking = {
        id: doc.id,
        ...data,
        checkIn: data.checkIn.toDate(),
        checkOut: data.checkOut.toDate(),
        lastChanged: data.lastChanged.toDate(),
    };
    return booking;
}

export async function getBookingsForHotel(hotelId: string): Promise<Booking[]> {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('hotelId', '==', hotelId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return [];
    }

    return querySnapshot.docs.map(toBooking);
}

export async function getBooking(hotelId: string, bookingId: string): Promise<Booking | null> {
    const docRef = doc(db, 'bookings', bookingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().hotelId !== hotelId) {
        return null;
    }
    return toBooking(docSnap);
}


export async function createBooking(hotelId: string, booking: Omit<Booking, 'id' | 'lastChanged'>): Promise<Booking> {
    const bookingsCol = collection(db, 'bookings');
    const newBookingData = {
        ...booking,
        hotelId: hotelId, // Ensure hotelId is saved in the document
        checkIn: Timestamp.fromDate(new Date(booking.checkIn)),
        checkOut: Timestamp.fromDate(new Date(booking.checkOut)),
        lastChanged: Timestamp.now(),
        status: 'Sent', // Initial status
    };
    const docRef = await addDoc(bookingsCol, newBookingData);
    
    const createdDoc = await getDoc(docRef);
    if (!createdDoc.exists()) {
      throw new Error("Failed to create and retrieve booking.");
    }
    return toBooking(createdDoc);
}

export async function updateBookingGuestDetails(
  hotelId: string,
  bookingId: string, 
  guestDetails: Partial<Guest>,
  notes: string,
  paymentOption: 'deposit' | 'full'
): Promise<void> {
  const docRef = doc(db, 'bookings', bookingId);
  
  const booking = await getBooking(hotelId, bookingId);
  if (!booking) throw new Error("Booking not found or you don't have permission.");

  const paymentStatus: Booking['status'] = paymentOption === 'deposit' ? 'Partial Payment' : 'Confirmed';

  await updateDoc(docRef, {
    guestDetails: guestDetails,
    notes: notes,
    paymentOption: paymentOption,
    status: paymentStatus, 
    lastChanged: Timestamp.now(),
  });
}

export async function deleteBooking(hotelId: string, bookingId: string): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingToDelete = await getBooking(hotelId, bookingId);

    // Security check: Ensure the booking belongs to the hotel
    if (!bookingToDelete) {
        throw new Error("Booking not found or you don't have permission to delete it.");
    }
    
    const filesToDelete: string[] = [];
    if (bookingToDelete.guestDetails?.idFrontUrl) filesToDelete.push(bookingToDelete.guestDetails.idFrontUrl);
    if (bookingToDelete.guestDetails?.idBackUrl) filesToDelete.push(bookingToDelete.guestDetails.idBackUrl);
    if (bookingToDelete.paymentProofUrl) filesToDelete.push(bookingToDelete.paymentProofUrl);

    // Delete associated files from Storage
    for (const fileUrl of filesToDelete) {
        try {
            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef);
        } catch (error: any) {
             // If the object doesn't exist or we don't have permission,
             // we can ignore the error and proceed with deleting the DB entry.
            if (error.code !== 'storage/object-not-found') {
                console.warn(`Could not delete file ${fileUrl}, proceeding with db delete:`, error.code);
            }
        }
    }

    // Delete the booking document from Firestore
    await deleteDoc(bookingRef);
}

    