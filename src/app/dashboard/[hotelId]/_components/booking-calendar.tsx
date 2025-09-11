'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function BookingCalendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    
    // In a real app, this would be derived from booking data
    const arrivalDates = [new Date(new Date().setDate(10)), new Date(new Date().setDate(12))];
    const departureDates = [new Date(new Date().setDate(15)), new Date(new Date().setDate(18))];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Buchungskalender</CardTitle>
                <CardDescription>Anreisen und Abreisen auf einen Blick.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    modifiers={{
                        arrival: arrivalDates,
                        departure: departureDates
                    }}
                    modifiersStyles={{
                        arrival: { border: '2px solid hsl(var(--primary))', borderRadius: 'var(--radius)' },
                        departure: { border: '2px solid hsl(var(--destructive))', borderRadius: 'var(--radius)' }
                    }}
                />
                <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-primary"></div>
                        <span className="text-sm">Anreise</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-destructive"></div>
                        <span className="text-sm">Abreise</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
