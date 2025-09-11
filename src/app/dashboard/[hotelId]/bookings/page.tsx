import Link from 'next/link';
import { File, ListFilter, PlusCircle, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingTable from './_components/booking-table';
import PageHeader from '@/components/page-header';

export default function BookingsPage({ params }: { params: { hotelId: string } }) {
  return (
    <>
      <PageHeader title="Buchungsübersicht">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter nach Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Bestätigt</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Ausstehend</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Storniert</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" asChild className="h-8 gap-1">
            <Link href={`/dashboard/${params.hotelId}/bookings/create`}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Neue Buchung
              </span>
            </Link>
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
           <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Suche nach Gast oder Buchungs-ID..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-1/3 lg:w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <BookingTable />
        </CardContent>
      </Card>
    </>
  );
}
