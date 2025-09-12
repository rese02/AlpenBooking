import { notFound } from 'next/navigation';
import { getBooking, getHotel } from '@/lib/hotel-service';
import BookingCompletionForm from './_components/booking-completion-form';


export default async function GuestBookingPage({ params }: { params: { linkId: string } }) {
  // In a real app, the linkId might not be the hotelId. 
  // We'd need a lookup table: guestLinks/{linkId} -> {hotelId, bookingId}
  // For this prototype, we'll assume a structure we can parse if needed, but for now...
  // Let's assume hotelId is part of the context or a fixed value for the prototype.
  // A better approach would be to have a collection `bookingLinks` that maps a unique linkId 
  // to a hotelId and bookingId. For now, we'll assume a hardcoded hotelId to find the booking.
  
  // THIS IS A TEMPORARY WORKAROUND
  const hotelId = 'hotel_alpenrose'; // We need a way to resolve linkId to hotelId
  const bookingId = params.linkId;

  const [hotel, booking] = await Promise.all([
    getHotel(hotelId),
    getBooking(hotelId, bookingId)
  ]);

  if (!booking || !hotel) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-headline font-bold">Buchung vervollständigen</h1>
            <p className="text-muted-foreground">Schritt 1 von 5: Gast</p>
        </div>
        <BookingCompletionForm booking={booking} hotel={hotel} />
    </div>
  );
}
