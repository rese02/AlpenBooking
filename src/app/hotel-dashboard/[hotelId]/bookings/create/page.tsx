
// Diese Datei hat KEIN 'use client' - sie ist eine Server Component

import CreateBookingForm from './create-booking-form';

// Server Components dürfen `params` direkt und ohne Warnung auslesen
export default function CreateBookingPage({ params }: { params: { hotelId: string } }) {
  return (
    <CreateBookingForm hotelId={params.hotelId} />
  );
}
