
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info, Calendar, Euro, Bed, Utensils, User, Phone, Mail, Users, CreditCard, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import type { Booking, Hotel, Guest } from '@/lib/types';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { updateBookingGuestDetails } from '@/lib/hotel-service';
import { useToast } from '@/hooks/use-toast';

const WizardStep = ({ current, step, name, completed }: { current: boolean, step: number, name: string, completed: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${completed ? 'bg-primary text-primary-foreground' : current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {completed ? <Check className="h-5 w-5" /> : step}
        </div>
        <span className={`text-xs text-center transition-colors ${completed ? 'text-primary font-semibold' : current ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{name}</span>
    </div>
);

const steps = ["Gast", "Begleitung", "Zahl-Option", "Zahl-Details", "Prüfung"];

export default function BookingCompletionForm({ booking, hotel }: { booking: Booking, hotel: Hotel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [guestDetails, setGuestDetails] = useState<Partial<Guest>>({
    firstName: booking.guest.firstName,
    lastName: booking.guest.lastName,
    email: '',
    phone: '',
    age: undefined,
  });
  const [notes, setNotes] = useState(booking.notes || '');
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('deposit');


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === 'notes') {
      setNotes(value);
    } else {
      setGuestDetails(prev => ({...prev, [id]: value}));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
        handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
        toast({
            title: "Fehlende Angaben",
            description: "Bitte füllen Sie alle Pflichtfelder (*) im ersten Schritt aus.",
            variant: "destructive",
        });
        setCurrentStep(1);
        return;
    }
    
    setIsLoading(true);
    try {
        await updateBookingGuestDetails(
            params.hotelId as string,
            params.bookingId as string,
            guestDetails,
            notes,
            paymentOption
        );
        router.push(`/guest/${params.hotelId}/${params.bookingId}/thank-you`);
    } catch (error) {
        console.error("Failed to update booking:", error);
        toast({
            title: "Fehler",
            description: "Ihre Buchung konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const nights = differenceInDays(booking.checkOut, booking.checkIn);

  const renderStepContent = () => {
    switch (currentStep) {
        case 1: // Gast
            return (
                <div>
                    <h3 className="font-semibold mb-2">Ihre Daten (Hauptbucher)</h3>
                    <p className="text-sm text-muted-foreground mb-4">Bitte füllen Sie die folgenden Felder aus.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="flex items-center gap-1"><User className="h-3 w-3"/> Vorname *</Label>
                            <Input id="firstName" value={guestDetails.firstName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="flex items-center gap-1"><User className="h-3 w-3"/> Nachname *</Label>
                            <Input id="lastName" value={guestDetails.lastName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-1"><Mail className="h-3 w-3"/> E-Mail *</Label>
                            <Input id="email" type="email" placeholder="Deine E-Mail-Adresse" value={guestDetails.email} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-1"><Phone className="h-3 w-3"/> Telefon *</Label>
                            <Input id="phone" type="tel" placeholder="Deine Telefonnummer" value={guestDetails.phone} onChange={handleInputChange}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="age">Alter (optional, mind. 18)</Label>
                            <Input id="age" type="number" placeholder="Dein Alter (z.B. 30)" value={guestDetails.age} onChange={handleInputChange}/>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Ausweisdokumente *</h3>
                        <p className="text-sm text-muted-foreground mb-4">Bitte wählen Sie, wie Sie die Ausweisdokumente bereitstellen möchten.</p>
                        <RadioGroup defaultValue="later" className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="now" id="now" className="peer sr-only" disabled />
                                <Label htmlFor="now" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-not-allowed opacity-50">
                                    Jetzt hochladen
                                    <span className="text-xs text-muted-foreground">(bald verfügbar)</span>
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

                    <div className="mt-6 space-y-4">
                        <h3 className="font-semibold">Ihre Anmerkungen (optional)</h3>
                        <Textarea id="notes" placeholder="Ihre Anmerkungen..." value={notes} onChange={handleInputChange} />
                    </div>
                </div>
            )
        case 2: // Begleitung
            return (
                 <div>
                    <h3 className="font-semibold mb-2">Mitreisende Personen</h3>
                    <p className="text-sm text-muted-foreground mb-4">Bitte geben Sie die Daten aller Mitreisenden an.</p>
                    <div className="text-center p-8 bg-muted/50 rounded-lg">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h4 className="mt-4 text-lg font-semibold">Funktion in Kürze verfügbar</h4>
                        <p className="mt-2 text-sm text-muted-foreground">Die Erfassung von Mitreisenden wird bald freigeschaltet.</p>
                    </div>
                </div>
            )
        case 3: // Zahl-Option
            return (
                <div>
                    <h3 className="font-semibold mb-2">Zahlungsoption wählen</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sie haben die Wahl zwischen einer Anzahlung oder der vollständigen Bezahlung.</p>
                    <RadioGroup value={paymentOption} onValueChange={(val: 'deposit' | 'full') => setPaymentOption(val)} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="deposit" id="deposit" className="peer sr-only" />
                            <Label htmlFor="deposit" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <span className="font-bold">Anzahlung</span>
                                <span className="text-sm text-muted-foreground mt-1">30% jetzt, Rest vor Ort</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="full" id="full" className="peer sr-only" />
                            <Label htmlFor="full" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <span className="font-bold">Vollzahlung</span>
                                <span className="text-sm text-muted-foreground mt-1">100% jetzt bezahlen</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            )
        case 4: // Zahl-Details
             return (
                <div>
                    <h3 className="font-semibold mb-2">Zahlungsdetails</h3>
                    <p className="text-sm text-muted-foreground mb-4">Wählen Sie Ihre bevorzugte Zahlungsmethode.</p>
                     <div className="text-center p-8 bg-muted/50 rounded-lg">
                        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h4 className="mt-4 text-lg font-semibold">Funktion in Kürze verfügbar</h4>
                        <p className="mt-2 text-sm text-muted-foreground">Die Online-Zahlung wird bald freigeschaltet. Bitte fahren Sie fort, um per Banküberweisung zu zahlen.</p>
                    </div>
                </div>
            )
        case 5: // Prüfung
            return (
                <div>
                    <h3 className="font-semibold mb-2">Buchung prüfen & abschließen</h3>
                    <p className="text-sm text-muted-foreground mb-4">Bitte überprüfen Sie alle Angaben vor dem Absenden.</p>
                    <div className="text-center p-8 bg-muted/50 rounded-lg">
                        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h4 className="mt-4 text-lg font-semibold">Fast geschafft!</h4>
                        <p className="mt-2 text-sm text-muted-foreground">Klicken Sie auf "Buchung abschließen", um Ihre Daten zu übermitteln. Sie erhalten im Anschluss eine Bestätigung per E-Mail.</p>
                    </div>
                </div>
            )
        default:
            return null;
    }
  }

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-headline font-bold text-center">Buchung vervollständigen</h1>
            <p className="text-muted-foreground text-center">Schritt {currentStep} von {steps.length}: {steps[currentStep - 1]}</p>
        </div>
        <div className="flex justify-center items-start mb-8">
            <div className="flex items-center w-full max-w-2xl">
                {steps.map((name, index) => (
                    <React.Fragment key={index}>
                        <WizardStep 
                            current={currentStep === index + 1} 
                            step={index + 1} 
                            name={name} 
                            completed={currentStep > index + 1}
                        />
                        {index < steps.length - 1 && <div className="flex-1 h-px bg-border mx-2"></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Ihre Buchungsübersicht
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4"/> Zeitraum:</div>
                        <div>{format(booking.checkIn, 'dd.MM.yy')} - {format(booking.checkOut, 'dd.MM.yy')} ({nights} Nächte)</div>

                        <div className="flex items-center gap-2 text-muted-foreground"><Bed className="h-4 w-4"/> Zimmer:</div>
                        <div>{booking.room.adults} Erw. {booking.room.children > 0 && `, ${booking.room.children} Kind(er)`}</div>
                        
                         <div className="flex items-center gap-2 text-muted-foreground"><Utensils className="h-4 w-4"/> Verpflegung:</div>
                        <div>{booking.mealType}</div>

                        <div className="flex items-center gap-2 text-muted-foreground font-semibold"><Euro className="h-4 w-4"/> Gesamtpreis:</div>
                        <div className="font-semibold">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.totalPrice)}</div>

                    </div>
                </div>

                <div className="min-h-[250px]">
                    {renderStepContent()}
                </div>
                
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1 || isLoading}>
                Zurück
                </Button>
                <Button onClick={handleNext} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentStep === steps.length ? 'Buchung abschließen' : 'Speichern & Weiter'}
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
