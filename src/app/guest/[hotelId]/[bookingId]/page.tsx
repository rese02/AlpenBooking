
import { notFound } from 'next/navigation';
import { getBooking, getHotel } from '@/lib/hotel-service';
import BookingCompletionForm from './_components/booking-completion-form';


export default async function GuestBookingPage({ params }: { params: { hotelId: string, bookingId: string } }) {
  
  const [hotel, booking] = await Promise.all([
    getHotel(params.hotelId),
    getBooking(params.hotelId, params.bookingId)
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
