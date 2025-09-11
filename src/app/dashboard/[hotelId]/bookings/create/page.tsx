import Link from 'next/link';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
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

export default function CreateBookingPage({ params }: { params: { hotelId: string } }) {
  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href={`/dashboard/${params.hotelId}/bookings`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Zurück</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
          Neue Buchung erstellen
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/${params.hotelId}/bookings`}>Verwerfen</Link>
          </Button>
          <Button size="sm" asChild>
             <Link href={`/dashboard/${params.hotelId}/bookings`}>Buchung erstellen & Link generieren</Link>
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
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input id="firstName" type="text" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input id="lastName" type="text" />
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
                <Label htmlFor="roomType">Zimmertyp</Label>
                <Select>
                    <SelectTrigger id="roomType">
                        <SelectValue placeholder="Zimmertyp auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="single">Einzelzimmer</SelectItem>
                        <SelectItem value="double">Doppelzimmer</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="adults">Erwachsene</Label>
                  <Input id="adults" type="number" defaultValue={2} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="children">Kinder</Label>
                  <Input id="children" type="number" defaultValue={0} />
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
                  <Textarea placeholder="z.B. Stammgast, hat nach ruhigem Zimmer gefragt..."/>
              </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Buchungsdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                        <Label>Anreisedatum</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "justify-start text-left font-normal",
                                !Date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(new Date(), "PPP")}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-3">
                        <Label>Abreisedatum</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "justify-start text-left font-normal",
                                !Date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(new Date(new Date().setDate(new Date().getDate() + 5)), "PPP")}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="mealType">Verpflegungsart</Label>
                    <Select>
                        <SelectTrigger id="mealType">
                            <SelectValue placeholder="Verpflegung auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Keine</SelectItem>
                            <SelectItem value="breakfast">Frühstück</SelectItem>
                            <SelectItem value="half">Halbpension</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="totalPrice">Gesamtpreis</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">€</span>
                        <Input id="totalPrice" type="number" className="pl-7" placeholder="0.00" />
                    </div>
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="guestLanguage">Sprache für Gast</Label>
                    <Select defaultValue='de'>
                        <SelectTrigger id="guestLanguage">
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
            <Link href={`/dashboard/${params.hotelId}/bookings`}>Verwerfen</Link>
          </Button>
          <Button size="sm" asChild>
             <Link href={`/dashboard/${params.hotelId}/bookings`}>Buchung erstellen & Link generieren</Link>
          </Button>
        </div>
    </div>
  );
}
