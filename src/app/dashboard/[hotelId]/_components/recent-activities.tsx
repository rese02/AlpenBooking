import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getBookingsForHotel } from '@/lib/hotel-service';
import type { Booking } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default async function RecentActivities({ hotelId }: { hotelId: string }) {
    let recentBookings: Booking[] = [];
    let error: string | null = null;
    try {
        const allBookings = await getBookingsForHotel(hotelId);
        // Sort by lastChanged date descending and take the first 5
        recentBookings = allBookings
            .sort((a, b) => b.lastChanged.getTime() - a.lastChanged.getTime())
            .slice(0, 5);
    } catch (e: any) {
        error = e.message;
        console.error(e);
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Letzte Aktivitäten</CardTitle>
                <CardDescription>Die letzten 5 aktualisierten Buchungen.</CardDescription>
            </CardHeader>
            <CardContent>
                {error && <Alert variant="destructive"><AlertTitle>Fehler</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                {!error && recentBookings.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        Noch keine Aktivitäten vorhanden.
                    </div>
                )}
                <div className="space-y-8">
                    {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://i.pravatar.cc/40?u=${booking.guest.firstName}`} alt="Avatar" />
                                <AvatarFallback>
                                    {booking.guest.firstName.charAt(0)}
                                    {booking.guest.lastName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {booking.guest.firstName} {booking.guest.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Status: {booking.status}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.totalPrice)}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
