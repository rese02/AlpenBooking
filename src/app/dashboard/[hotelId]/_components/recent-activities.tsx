'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockBookings } from '@/lib/mock-data';

export default function RecentActivities() {
    const recentBookings = mockBookings.slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Letzte Aktivitäten</CardTitle>
                <CardDescription>Die letzten 5 aktualisierten Buchungen.</CardDescription>
            </CardHeader>
            <CardContent>
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
