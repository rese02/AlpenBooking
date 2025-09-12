

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

  // Redirect if booking is already completed
  if (booking.status !== 'Sent' && booking.status !== 'Draft') {
      // Maybe redirect to a "booking already completed" page in the future
      notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
        <BookingCompletionForm booking={booking} hotel={hotel} />
    </div>
  );
}
