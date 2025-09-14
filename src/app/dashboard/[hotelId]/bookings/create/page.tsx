

import CreateBookingForm from './create-booking-form';
import { getHotel } from '@/lib/hotel-service';
import { notFound } from 'next/navigation';

// Server Components dürfen `params` direkt und ohne Warnung auslesen
export default async function CreateBookingPage({ params }: { params: { hotelId: string } }) {
  const hotel = await getHotel(params.hotelId);

  if (!hotel) {
    notFound();
  }

  return (
    <CreateBookingForm hotel={hotel} />
  );
}
