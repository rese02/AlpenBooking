
'use client';

import { MoreHorizontal, Pencil, Copy, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Booking, BookingStatus } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { getBookingsForHotel } from '@/lib/hotel-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const statusVariant: Record<BookingStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    'Sent': 'outline',
    'Partial Payment': 'secondary',
    'Confirmed': 'default',
    'Cancelled': 'destructive',
    'Draft': 'outline',
    'Completed': 'default',
};

export default function BookingTable() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [bookings, setBookings] = React.useState<Booking[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const hotelId = typeof params.hotelId === 'string' ? params.hotelId : '';

    React.useEffect(() => {
        const fetchBookings = async () => {
            if (!hotelId) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await getBookingsForHotel(hotelId);
                setBookings(data);
            } catch (e: any) {
                setError(e.message);
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [hotelId]);

    const handleViewDetails = (bookingId: string) => {
        router.push(`/dashboard/${hotelId}/bookings/${bookingId}`);
    }

    const handleCopyLink = (bookingId: string) => {
        const link = `${window.location.origin}/guest/${hotelId}/${bookingId}`;
        navigator.clipboard.writeText(link)
            .then(() => {
                toast({
                    title: 'Link kopiert!',
                    description: 'Der Buchungslink wurde in die Zwischenablage kopiert.',
                });
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                toast({
                    title: 'Fehler',
                    description: 'Der Link konnte nicht kopiert werden.',
                    variant: 'destructive',
                });
            });
    };

    if (isLoading) {
        return <div className="text-center py-8">Lade Buchungen...</div>
    }

    if (error) {
        return <Alert variant="destructive"><AlertTitle>Fehler</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
    }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gast</TableHead>
          <TableHead>Check-in</TableHead>
          <TableHead>Check-out</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Letzte Änderung</TableHead>
          <TableHead>
            <span className="sr-only">Aktionen</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.length === 0 ? (
             <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Noch keine Buchungen für dieses Hotel vorhanden.
                </TableCell>
              </TableRow>
        ) : (
            bookings.map((booking) => (
                <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                    {booking.guest.firstName} {booking.guest.lastName}
                    </TableCell>
                    <TableCell>{booking.checkIn.toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>{booking.checkOut.toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>
                    <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell>{booking.lastChanged.toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(booking.id!)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyLink(booking.id!)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Link kopieren
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))
        )}
      </TableBody>
    </Table>
  );
}
