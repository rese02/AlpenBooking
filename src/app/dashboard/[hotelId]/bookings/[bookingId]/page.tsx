import Link from 'next/link';
import { ArrowLeft, CreditCard, FileText, Hotel, Users, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockBookings } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';

export default function BookingDetailsPage({ params }: { params: { hotelId: string, bookingId: string } }) {
  const booking = mockBookings.find(b => b.id === params.bookingId);

  if (!booking) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
      <PageHeader title={`Buchung #${booking.id}`}>
         <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/${params.hotelId}/bookings`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Link>
        </Button>
        <Button size="sm">Bearbeiten</Button>
      </PageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center justify-between">
                <span>Buchungsübersicht</span>
                <Badge variant="default">{booking.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Check-in</span>
                <span>{booking.checkIn.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Check-out</span>
                <span>{booking.checkOut.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Zimmertyp</span>
                <span>{booking.room.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Verpflegung</span>
                <span>{booking.mealType}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Zahlung & Finanzen</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gesamtpreis</span>
                <span className="font-semibold">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bereits bezahlt</span>
                <span>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.totalPrice * 0.3)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Offener Betrag</span>
                <span className="font-bold text-primary">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.totalPrice * 0.7)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Gäste & Dokumente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Hauptgast</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{booking.guest.firstName} {booking.guest.lastName}</p>
                  <p>max.mustermann@email.com</p>
                  <p>+49 176 12345678</p>
                </div>
              </div>
              <Separator/>
               <div>
                <h3 className="font-semibold mb-2">Mitreisende</h3>
                <div className="text-sm text-muted-foreground">
                    <p>{booking.room.adults + booking.room.children -1} Person(en)</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Dokumente</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" /> Zahlungsnachweis.pdf
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" /> Ausweis_Max.pdf
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
