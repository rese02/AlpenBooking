'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, BookOpen, UserPlus, AlertTriangle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getBookingsForHotel } from '@/lib/hotel-service';
import type { Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, icon: Icon, subtext, isLoading }: { title: string, value: string, icon: React.ElementType, subtext?: string, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
                </>
            )}
        </CardContent>
    </Card>
);


export default function DashboardStats({ hotelId }: { hotelId: string }) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const data = await getBookingsForHotel(hotelId);
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings for stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [hotelId]);

    const totalRevenue = isLoading ? 0 : bookings
        .filter(b => b.status === 'Confirmed' || b.status === 'Partial Payment')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    const totalBookings = isLoading ? 0 : bookings.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysArrivals = isLoading ? 0 : bookings.filter(b => {
        const checkIn = new Date(b.checkIn);
        checkIn.setHours(0,0,0,0);
        return checkIn.getTime() === today.getTime() && b.status !== 'Cancelled';
    }).length;
    
    // Placeholder for actions
    const pendingActions = 0;

    const stats = [
        { title: "Gesamtumsatz", value: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalRevenue), icon: DollarSign, subtext: "Bestätigte Buchungen" },
        { title: "Gesamtbuchungen", value: totalBookings.toString(), icon: BookOpen, subtext: "Inkl. stornierte" },
        { title: "Heutige Anreisen", value: todaysArrivals.toString(), icon: UserPlus, subtext: "Geplante Check-ins" },
        { title: "Ausstehende Aktionen", value: pendingActions.toString(), icon: AlertTriangle, subtext: "z.B. fehlende Dokumente" },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <StatCard 
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    subtext={stat.subtext}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
}
