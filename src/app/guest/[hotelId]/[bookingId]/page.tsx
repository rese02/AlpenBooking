
import { notFound } from 'next/navigation';
import { getBooking, getHotel } from '@/lib/hotel-service';
import BookingCompletionForm from './_components/booking-completion-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck2 } from 'lucide-react';


export default async function GuestBookingPage({ params }: { params: { hotelId: string, bookingId: string } }) {
  
  const [hotel, booking] = await Promise.all([
    getHotel(params.hotelId),
    getBooking(params.hotelId, params.bookingId)
  ]);

  if (!booking || !hotel) {
    notFound();
  }

  // Redirect if booking is already completed by guest
  if (booking.status !== 'Sent' && booking.status !== 'Draft') {
      return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="items-center text-center">
                    <FileCheck2 className="h-16 w-16 text-primary mb-4" />
                    <CardTitle className="font-headline text-2xl">Buchung bereits abgeschlossen</CardTitle>
                    <CardDescription>
                        Die Daten für diese Buchung wurden bereits übermittelt. Sie müssen nichts weiter tun.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                   <p className="text-sm text-muted-foreground">Falls Sie Fragen haben, kontaktieren Sie bitte das Hotel direkt.</p>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
        <BookingCompletionForm booking={booking} hotel={hotel} />
    </div>
  );
}
