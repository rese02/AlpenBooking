

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { getBooking, getHotel } from "@/lib/hotel-service";
import { format } from "date-fns";

export default async function ThankYouPage({ params }: { params: { hotelId: string, bookingId: string } }) {

    const [hotel, booking] = await Promise.all([
        getHotel(params.hotelId),
        getBooking(params.hotelId, params.bookingId)
    ]);

    if (!hotel || !booking) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="items-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="font-headline text-2xl">Vielen Dank für Ihre Buchung!</CardTitle>
                    <CardDescription>
                        Ihre Daten wurden erfolgreich übermittelt. Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                        <p className="font-semibold">Buchungszusammenfassung</p>
                        <p><strong>Hotel:</strong> {hotel.name}</p>
                        <p><strong>Zeitraum:</strong> {format(booking.checkIn, 'dd.MM.yyyy')} - {format(booking.checkOut, 'dd.MM.yyyy')}</p>
                        <p><strong>Gast:</strong> {booking.guestDetails?.firstName || booking.guest.firstName} {booking.guestDetails?.lastName || booking.guest.lastName}</p>
                    </div>
                    <Button asChild className="mt-6">
                        <Link href="/">Zur Startseite</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
