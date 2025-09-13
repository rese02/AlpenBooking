

'use client';

import { MoreHorizontal, Pencil, Copy, Trash2, Eye, Loader2 } from 'lucide-react';
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
import { getBookingsForHotel, deleteBooking } from '@/lib/hotel-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


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
    
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [bookingToDelete, setBookingToDelete] = React.useState<Booking | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);


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
    
    const openDeleteDialog = (booking: Booking) => {
        setBookingToDelete(booking);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!bookingToDelete?.id) return;
        setIsDeleting(true);
        try {
            await deleteBooking(bookingToDelete.id);
            toast({
                title: 'Buchung gelöscht',
                description: `Die Buchung für ${bookingToDelete.guest.firstName} ${bookingToDelete.guest.lastName} wurde gelöscht.`,
            });
            setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
        } catch (error) {
            console.error('Failed to delete booking:', error);
            toast({
                title: 'Fehler beim Löschen',
                description: 'Die Buchung konnte nicht gelöscht werden.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
            setIsAlertOpen(false);
            setBookingToDelete(null);
        }
    };


    const handleCopyLink = (bookingId: string) => {
        const link = `${window.location.origin}/guest/${bookingId}`;
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
    <>
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
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(booking)}>
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

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Buchung für "{bookingToDelete?.guest.firstName} {bookingToDelete?.guest.lastName}" wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setIsAlertOpen(false)}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
