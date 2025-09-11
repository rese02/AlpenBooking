
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Plus, Trash } from 'lucide-react';
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
import { createHotel } from '@/lib/hotel-service';
import { useToast } from '@/hooks/use-toast';

export default function CreateHotelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hotelName, setHotelName] = useState('');
  const [domain, setDomain] = useState('');
  
  const handleCreateHotel = async () => {
    if (!hotelName || !domain) {
      toast({
        title: 'Fehlende Informationen',
        description: 'Bitte füllen Sie Hotelname und Domain aus.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await createHotel({ name: hotelName, domain });
      toast({
        title: 'Hotel erstellt',
        description: `Das Hotel "${hotelName}" wurde erfolgreich erstellt.`,
      });
      router.push('/admin');
    } catch (error) {
      console.error('Error creating hotel:', error);
      toast({
        title: 'Fehler',
        description: 'Das Hotel konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
          Neues Hotel-System erstellen
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">Verwerfen</Link>
          </Button>
          <Button size="sm" onClick={handleCreateHotel}>
            Hotel erstellen
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Basisinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="hotelName">Hotelname</Label>
                <Input id="hotelName" type="text" className="w-full" placeholder="z.B. Hotel Alpenrose" value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" type="text" className="w-full" placeholder="z.B. alpenrose.alpen.link" value={domain} onChange={(e) => setDomain(e.target.value)} />
              </div>
               <div className="grid gap-3">
                <Label htmlFor="logo">Logo</Label>
                <Input id="logo" type="file" className="w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Öffentliche Kontaktdaten</CardTitle>
               <CardDescription>Diese Daten sind für Gäste sichtbar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid gap-3">
                <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
                <Input id="contactEmail" type="email" placeholder="info@hotel.com" />
              </div>
               <div className="grid gap-3">
                <Label htmlFor="contactPhone">Kontakt Telefon</Label>
                <Input id="contactPhone" type="tel" placeholder="+49 123 456789" />
              </div>
               <div className="grid gap-3">
                <Label htmlFor="address">Adresse</Label>
                <Textarea id="address" placeholder="Musterstraße 1, 12345 Musterstadt, Deutschland" />
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Bankverbindung</CardTitle>
              <CardDescription>Wird Gästen für die Zahlungsanweisungen angezeigt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="accountHolder">Kontoinhaber</Label>
                <Input id="accountHolder" type="text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input id="iban" type="text" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="bic">BIC</Label>
                  <Input id="bic" type="text" />
                </div>
              </div>
               <div className="grid gap-3">
                <Label htmlFor="bankName">Bankname</Label>
                <Input id="bankName" type="text" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">E-Mail-Versand (SMTP)</CardTitle>
              <CardDescription>Zugangsdaten für den E-Mail-Versand im Namen des Hotels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" type="text" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" type="number" />
                  </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="smtpUser">Benutzer</Label>
                <Input id="smtpUser" type="text" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="smtpPass">Passwort</Label>
                <Input id="smtpPass" type="password" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Hotelier-Zugang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="hotelierEmail">E-Mail des Hoteliers</Label>
                <Input id="hotelierEmail" type="email" placeholder="hotelier@mail.com" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="hotelierPassword">Passwort</Label>
                 <div className="flex gap-2">
                    <Input id="hotelierPassword" type="text" readOnly value="GeneriertesSicheresPasswort123!" />
                    <Button variant="outline" size="icon">
                        <KeyRound className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Buchungskonfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Zimmerkategorien</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Input defaultValue="Einzelzimmer" /> <Button size="icon" variant="ghost"><Trash className="h-4 w-4 text-muted-foreground"/></Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input defaultValue="Doppelzimmer" /> <Button size="icon" variant="ghost"><Trash className="h-4 w-4 text-muted-foreground"/></Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full"><Plus className="h-4 w-4 mr-2"/> Kategorie hinzufügen</Button>
                </div>
              </div>
               <div>
                <Label>Verpflegungsarten</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Input defaultValue="Frühstück" /> <Button size="icon" variant="ghost"><Trash className="h-4 w-4 text-muted-foreground"/></Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input defaultValue="Halbpension" /> <Button size="icon" variant="ghost"><Trash className="h-4 w-4 text-muted-foreground"/></Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full"><Plus className="h-4 w-4 mr-2"/> Art hinzufügen</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">Verwerfen</Link>
        </Button>
        <Button size="sm" onClick={handleCreateHotel}>
          Hotel erstellen
        </Button>
      </div>
    </div>
  );
}

    