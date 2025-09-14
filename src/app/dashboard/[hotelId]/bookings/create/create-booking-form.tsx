
'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { createBooking } from '@/lib/hotel-service';
import type { Booking, Hotel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


// This is the Client Component that contains the form logic
export default function CreateBookingForm({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const hotelId = hotel.id;

  const [date, setDate] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    // Set initial date range only on the client to avoid hydration issues
    setDate({
      from: new Date(),
      to: new Date(new Date().setDate(new Date().getDate() + 5)),
    });
  }, []);

  const [formData, setFormData] = useState<Partial<Booking>>({
    guest: { firstName: '', lastName: ''},
    room: { type: hotel.roomCategories?.[0] || '', adults: 2, children: 0},
    mealType: hotel.mealTypes?.[0] || 'Frühstück',
    totalPrice: 0,
    language: 'de',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const valueToSet = e.target.type === 'number' ? parseInt(value, 10) || 0 : value;

    if (id.startsWith('guest.')) {
        const key = id.split('.')[1] as keyof Booking['guest'];
        setFormData(prev => ({ ...prev, guest: { ...prev.guest!, [key]: valueToSet }}));
    } else if (id.startsWith('room.')) {
        const key = id.split('.')[1] as keyof Booking['room'];
        setFormData(prev => ({ ...prev, room: { ...prev.room!, [key]: valueToSet }}));
    } else {
        setFormData(prev => ({ ...prev, [id]: valueToSet }));
    }
  };

  const handleSelectChange = (id: 'room.type' | 'mealType' | 'language') => (value: string) => {
    if (id.startsWith('room.')) {
        const key = id.split('.')[1] as keyof Booking['room'];
        setFormData(prev => ({ ...prev, room: { ...prev.room!, [key]: value }}));
    } else {
         setFormData(prev => ({ ...prev, [id]: value }));
    }
  }

  const handleCreateBooking = async () => {
    if (!date?.from || !date?.to || !formData.guest?.firstName || !formData.totalPrice) {
        toast({
            title: 'Fehlende Informationen',
            description: 'Bitte füllen Sie mindestens Gast-Vorname, Reisezeitraum und Preis aus.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);
    try {
      const bookingData: Omit<Booking, 'id' | 'lastChanged'> = {
        hotelId: hotelId,
        checkIn: date.from,
        checkOut: date.to,
        status: 'Sent',
        guest: {
          firstName: formData.guest.firstName || '',
          lastName: formData.guest.lastName || '',
        },
        room: {
          type: formData.room?.type || 'Standard',
          adults: formData.room?.adults || 1,
          children: formData.room?.children || 0,
        },
        mealType: formData.mealType || 'Keine',
        totalPrice: formData.totalPrice || 0,
        language: formData.language || 'de',
        notes: formData.notes || '',
      };
      
      await createBooking(hotelId, bookingData);
      
      toast({
        title: 'Buchung erstellt',
        description: `Der Buchungslink für ${formData.guest.firstName} ${formData.guest.lastName} wurde generiert.`,
      });

      router.push(`/dashboard/${hotelId}/bookings`);

    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: 'Fehler',
        description: 'Die Buchung konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href={`/dashboard/${hotelId}/bookings`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Zurück</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
          Neue Buchung erstellen
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/${hotelId}/bookings`}>Verwerfen</Link>
          </Button>
          <Button size="sm" onClick={handleCreateBooking} disabled={isLoading}>
            {isLoading ? 'Wird erstellt...' : 'Buchung erstellen & Link generieren'}
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Gastdaten</CardTitle>
              <CardDescription>Diese Daten werden dem Gast im Formular vorausgefüllt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="guest.firstName">Vorname</Label>
                  <Input id="guest.firstName" type="text" value={formData.guest?.firstName} onChange={handleInputChange} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="guest.lastName">Nachname</Label>
                  <Input id="guest.lastName" type="text" value={formData.guest?.lastName} onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Zimmerkonfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid gap-3">
                <Label htmlFor="room.type">Zimmertyp</Label>
                <Select value={formData.room?.type} onValueChange={handleSelectChange('room.type')}>
                    <SelectTrigger id="room.type">
                        <SelectValue placeholder="Zimmertyp auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                        {hotel.roomCategories && hotel.roomCategories.length > 0 ? (
                            hotel.roomCategories.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))
                        ) : (
                            <SelectItem value="Standard" disabled>Keine Kategorien konfiguriert</SelectItem>
                        )}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="room.adults">Erwachsene</Label>
                  <Input id="room.adults" type="number" value={formData.room?.adults} onChange={handleInputChange} min="1" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="room.children">Kinder</Label>
                  <Input id="room.children" type="number" value={formData.room?.children} onChange={handleInputChange} min="0" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">Interne Bemerkungen</CardTitle>
                  <CardDescription>Diese Notizen sind nur für Sie sichtbar.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Textarea id="notes" placeholder="z.B. Stammgast, hat nach ruhigem Zimmer gefragt..." value={formData.notes || ''} onChange={handleInputChange}/>
              </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Buchungsdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Label>Reisezeitraum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "dd. LLL, y", { locale: de })} -{" "}
                              {format(date.to, "dd. LLL, y", { locale: de })}
                            </>
                          ) : (
                            format(date.from, "dd. LLL, y", { locale: de })
                          )
                        ) : (
                          <span>Wählen Sie ein Datum</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                        locale={de}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="mealType">Verpflegungsart</Label>
                    <Select value={formData.mealType} onValueChange={handleSelectChange('mealType')}>
                        <SelectTrigger id="mealType">
                            <SelectValue placeholder="Verpflegung auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                             {hotel.mealTypes && hotel.mealTypes.length > 0 ? (
                                hotel.mealTypes.map((meal) => (
                                    <SelectItem key={meal} value={meal}>{meal}</SelectItem>
                                ))
                            ) : (
                                 <SelectItem value="Keine" disabled>Keine Verpflegung konfiguriert</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="totalPrice">Gesamtpreis</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">€</span>
                        <Input id="totalPrice" type="number" className="pl-7" placeholder="0.00" value={formData.totalPrice} onChange={handleInputChange} />
                    </div>
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="language">Sprache für Gast</Label>
                    <Select value={formData.language} onValueChange={handleSelectChange('language')} defaultValue='de'>
                        <SelectTrigger id="language">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="en">Englisch</SelectItem>
                            <SelectItem value="it">Italienisch</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
       <div className="flex items-center justify-center gap-2 md:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/${hotelId}/bookings`}>Verwerfen</Link>
          </Button>
          <Button size="sm" onClick={handleCreateBooking} disabled={isLoading}>
             {isLoading ? 'Wird erstellt...' : 'Buchung erstellen & Link generieren'}
          </Button>
        </div>
    </div>
  );
}
