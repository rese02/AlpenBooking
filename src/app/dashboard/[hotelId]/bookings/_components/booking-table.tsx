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
import { mockBookings } from '@/lib/mock-data';
import type { BookingStatus } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';

const statusVariant: Record<BookingStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    'Confirmed': 'default',
    'Partial Payment': 'secondary',
    'Sent': 'outline',
    'Cancelled': 'destructive',
};

export default function BookingTable() {
    const params = useParams();
    const router = useRouter();

    const handleViewDetails = (bookingId: string) => {
        router.push(`/dashboard/${params.hotelId}/bookings/${bookingId}`);
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
        {mockBookings.map((booking) => (
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
                  <DropdownMenuItem onClick={() => handleViewDetails(booking.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Details anzeigen
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem>
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
        ))}
      </TableBody>
    </Table>
  );
}
