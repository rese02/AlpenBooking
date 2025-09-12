
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info, Calendar, Euro, Bed, Utensils, User, Phone, Mail, FileUp } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import type { Booking, Hotel } from '@/lib/types';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

const WizardStep = ({ current, step, name }: { current: boolean, step: number, name: string }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {step}
        </div>
        <span className={`text-xs ${current ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{name}</span>
    </div>
);


export default function BookingCompletionForm({ booking, hotel }: { booking: Booking, hotel: Hotel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const params = useParams();

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = () => {
    // In a real app, this would trigger the server action to save data.
    router.push(`/guest/${params.linkId}/thank-you`);
  }
  
  const nights = differenceInDays(booking.checkOut, booking.checkIn);

  return (
    <div>
        <div className="flex justify-center items-center mb-8">
            <div className="flex items-center w-full max-w-lg">
                <WizardStep current={currentStep === 1} step={1} name="Gast" />
                <div className="flex-1 h-px bg-border mx-2"></div>
                <WizardStep current={currentStep === 2} step={2} name="Begleitung" />
                <div className="flex-1 h-px bg-border mx-2"></div>
                <WizardStep current={currentStep === 3} step={3} name="Zahl-Option" />
                <div className="flex-1 h-px bg-border mx-2"></div>
                <WizardStep current={currentStep === 4} step={4} name="Zahl-Details" />
                <div className="flex-1 h-px bg-border mx-2"></div>
                <WizardStep current={currentStep === 5} step={5} name="Prüfung" />
            </div>
        </div>

        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Gast
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">Gast: {booking.guest.firstName} {booking.guest.lastName}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Info className="h-4 w-4"/> Ihre Buchungsübersicht</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4"/> Zeitraum:</div>
                        <div>{format(booking.checkIn, 'dd.MM.yyyy')} - {format(booking.checkOut, 'dd.MM.yyyy')}</div>

                        <div className="flex items-center gap-2 text-muted-foreground"><Euro className="h-4 w-4"/> Gesamtpreis:</div>
                        <div>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.totalPrice)}</div>

                        <div className="flex items-center gap-2 text-muted-foreground"><Bed className="h-4 w-4"/> Zimmer:</div>
                        <div>{booking.room.adults} Erw. {booking.room.children > 0 && `, ${booking.room.children} Kind(er)`}</div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground"><Utensils className="h-4 w-4"/> Verpflegung:</div>
                        <div>{booking.mealType}</div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Ihre Daten (Hauptbucher)</h3>
                    <p className="text-sm text-muted-foreground mb-4">Bitte füllen Sie die folgenden Felder aus.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="flex items-center gap-1"><User className="h-3 w-3"/> Vorname *</Label>
                            <Input id="firstName" defaultValue={booking.guest.firstName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="flex items-center gap-1"><User className="h-3 w-3"/> Nachname *</Label>
                            <Input id="lastName" defaultValue={booking.guest.lastName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-1"><Mail className="h-3 w-3"/> E-Mail *</Label>
                            <Input id="email" type="email" placeholder="Deine E-Mail-Adresse" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-1"><Phone className="h-3 w-3"/> Telefon *</Label>
                            <Input id="phone" type="tel" placeholder="Deine Telefonnummer" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="age">Alter (optional, mind. 18)</Label>
                            <Input id="age" type="number" placeholder="Dein Alter (z.B. 30)" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Ausweisdokumente *</h3>
                    <p className="text-sm text-muted-foreground mb-4">Bitte wählen Sie, wie Sie die Ausweisdokumente bereitstellen möchten.</p>
                    <RadioGroup defaultValue="later" className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="now" id="now" className="peer sr-only" />
                            <Label htmlFor="now" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                Jetzt hochladen
                            </Label>
                        </div>
                         <div>
                            <RadioGroupItem value="later" id="later" className="peer sr-only" />
                            <Label htmlFor="later" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                Vor Ort vorzeigen
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-4">
                     <h3 className="font-semibold">Ihre Anmerkungen (optional)</h3>
                     <Textarea placeholder="Ihre Anmerkungen..." />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
                Zurück
                </Button>
                <Button onClick={handleNext}>Speichern & Weiter</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
