
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
import { de, enGB, it } from 'date-fns/locale';
import { updateBookingGuestDetails } from '@/lib/hotel-service';
import { useToast } from '@/hooks/use-toast';

const locales = { de, en: enGB, it };

const translations = {
    de: {
        mainTitle: "Buchung vervollständigen",
        step: "Schritt",
        of: "von",
        steps: ["Gast", "Begleitung", "Zahl-Option", "Zahl-Details", "Prüfung"],
        overviewTitle: "Ihre Buchungsübersicht",
        period: "Zeitraum",
        nights: "Nächte",
        room: "Zimmer",
        adults: "Erw.",
        children: "Kind(er)",
        meal: "Verpflegung",
        totalPrice: "Gesamtpreis",
        back: "Zurück",
        next: "Speichern & Weiter",
        submit: "Buchung abschließen",
        // Step 1
        guestDataTitle: "Ihre Daten (Hauptbucher)",
        guestDataDesc: "Bitte füllen Sie die folgenden Felder aus.",
        firstName: "Vorname",
        lastName: "Nachname",
        email: "E-Mail",
        phone: "Telefon",
        age: "Alter (optional, mind. 18)",
        idDocs: "Ausweisdokumente",
        idDocsDesc: "Bitte wählen Sie, wie Sie die Ausweisdokumente bereitstellen möchten.",
        uploadNow: "Jetzt hochladen",
        uploadSoon: "(bald verfügbar)",
        showOnSite: "Vor Ort vorzeigen",
        notes: "Ihre Anmerkungen (optional)",
        // Step 2
        companionsTitle: "Mitreisende Personen",
        companionsDesc: "Bitte geben Sie die Daten aller Mitreisenden an.",
        featureSoon: "Funktion in Kürze verfügbar",
        companionsSoon: "Die Erfassung von Mitreisenden wird bald freigeschaltet.",
        // Step 3
        paymentOptionTitle: "Zahlungsoption wählen",
        paymentOptionDesc: "Sie haben die Wahl zwischen einer Anzahlung oder der vollständigen Bezahlung.",
        deposit: "Anzahlung",
        depositDesc: "30% jetzt, Rest vor Ort",
        fullPayment: "Vollzahlung",
        fullPaymentDesc: "100% jetzt bezahlen",
        // Step 4
        paymentDetailsTitle: "Zahlungsdetails",
        paymentDetailsDesc: "Bitte überweisen Sie den Betrag an die untenstehende Bankverbindung und laden Sie anschließend einen Beleg hoch.",
        bankTransferTitle: "Bankverbindung für Überweisung",
        accountHolder: "Kontoinhaber",
        iban: "IBAN",
        bic: "BIC",
        bank: "Bank",
        purpose: "Verwendungszweck",
        booking: "Buchung",
        uploadProof: "Zahlungsnachweis hochladen",
        uploadProofDesc: "Die Funktion zum Hochladen des Zahlungsnachweises wird bald verfügbar sein. Bitte fahren Sie ohne Upload fort.",
        // Step 5
        reviewTitle: "Buchung prüfen & abschließen",
        reviewDesc: "Bitte überprüfen Sie alle Angaben vor dem Absenden. Mit dem Abschluss der Buchung wird eine E-Mail an Sie versendet.",
        almostDone: "Fast geschafft!",
        reviewCta: "Klicken Sie auf \"Buchung abschließen\", um Ihre Daten zu übermitteln. Sie erhalten im Anschluss eine Bestätigung per E-Mail.",
        // Toasts
        toastMissingFieldsTitle: "Fehlende Angaben",
        toastMissingFieldsDesc: "Bitte füllen Sie alle Pflichtfelder (*) im ersten Schritt aus.",
        toastErrorTitle: "Fehler",
        toastErrorDesc: "Ihre Buchung konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
    },
    en: {
        mainTitle: "Complete Your Booking",
        step: "Step",
        of: "of",
        steps: ["Guest", "Companions", "Payment Option", "Payment Details", "Review"],
        overviewTitle: "Your Booking Summary",
        period: "Period",
        nights: "Nights",
        room: "Room",
        adults: "Ad.",
        children: "child(ren)",
        meal: "Board",
        totalPrice: "Total Price",
        back: "Back",
        next: "Save & Continue",
        submit: "Complete Booking",
        // Step 1
        guestDataTitle: "Your Details (Main Booker)",
        guestDataDesc: "Please fill in the following fields.",
        firstName: "First Name",
        lastName: "Last Name",
        email: "E-Mail",
        phone: "Phone",
        age: "Age (optional, min. 18)",
        idDocs: "Identity Documents",
        idDocsDesc: "Please choose how you want to provide the identity documents.",
        uploadNow: "Upload now",
        uploadSoon: "(coming soon)",
        showOnSite: "Show on site",
        notes: "Your Notes (optional)",
        // Step 2
        companionsTitle: "Companions",
        companionsDesc: "Please enter the details of all fellow travelers.",
        featureSoon: "Feature coming soon",
        companionsSoon: "Entering companion data will be available soon.",
        // Step 3
        paymentOptionTitle: "Choose Payment Option",
        paymentOptionDesc: "You can choose between a deposit or full payment.",
        deposit: "Deposit",
        depositDesc: "30% now, rest on site",
        fullPayment: "Full Payment",
        fullPaymentDesc: "Pay 100% now",
        // Step 4
        paymentDetailsTitle: "Payment Details",
        paymentDetailsDesc: "Please transfer the amount to the bank account below and then upload a receipt.",
        bankTransferTitle: "Bank Details for Transfer",
        accountHolder: "Account Holder",
        iban: "IBAN",
        bic: "BIC",
        bank: "Bank",
        purpose: "Reference",
        booking: "Booking",
        uploadProof: "Upload Proof of Payment",
        uploadProofDesc: "The feature to upload proof of payment will be available soon. Please continue without uploading.",
        // Step 5
        reviewTitle: "Review & Complete Booking",
        reviewDesc: "Please check all details before submitting. Upon completion, a confirmation email will be sent to you.",
        almostDone: "Almost there!",
        reviewCta: "Click on \"Complete Booking\" to submit your data. You will then receive a confirmation email.",
        // Toasts
        toastMissingFieldsTitle: "Missing Information",
        toastMissingFieldsDesc: "Please fill in all required fields (*) in the first step.",
        toastErrorTitle: "Error",
        toastErrorDesc: "Your booking could not be updated. Please try again.",
    },
    it: {
        mainTitle: "Completa la tua prenotazione",
        step: "Passo",
        of: "di",
        steps: ["Ospite", "Accompagnatori", "Opzione di pagamento", "Dettagli di pagamento", "Riepilogo"],
        overviewTitle: "Riepilogo della tua prenotazione",
        period: "Periodo",
        nights: "Notti",
        room: "Camera",
        adults: "Ad.",
        children: "bambino/i",
        meal: "Pensione",
        totalPrice: "Prezzo totale",
        back: "Indietro",
        next: "Salva e continua",
        submit: "Completa prenotazione",
        // Step 1
        guestDataTitle: "I tuoi dati (prenotante principale)",
        guestDataDesc: "Si prega di compilare i seguenti campi.",
        firstName: "Nome",
        lastName: "Cognome",
        email: "E-Mail",
        phone: "Telefono",
        age: "Età (opzionale, min. 18)",
        idDocs: "Documenti d'identità",
        idDocsDesc: "Scegli come fornire i documenti d'identità.",
        uploadNow: "Carica ora",
        uploadSoon: "(presto disponibile)",
        showOnSite: "Mostra in loco",
        notes: "Le tue note (opzionale)",
        // Step 2
        companionsTitle: "Accompagnatori",
        companionsDesc: "Inserisci i dati di tutti i compagni di viaggio.",
        featureSoon: "Funzione presto disponibile",
        companionsSoon: "L'inserimento dei dati degli accompagnatori sarà presto disponibile.",
        // Step 3
        paymentOptionTitle: "Scegli opzione di pagamento",
        paymentOptionDesc: "Puoi scegliere tra un acconto o il pagamento completo.",
        deposit: "Acconto",
        depositDesc: "30% ora, resto in loco",
        fullPayment: "Pagamento completo",
        fullPaymentDesc: "Paga il 100% ora",
        // Step 4
        paymentDetailsTitle: "Dettagli di pagamento",
        paymentDetailsDesc: "Si prega di trasferire l'importo sul conto bancario sottostante e quindi caricare una ricevuta.",
        bankTransferTitle: "Dettagli bancari per il bonifico",
        accountHolder: "Titolare del conto",
        iban: "IBAN",
        bic: "BIC",
        bank: "Banca",
        purpose: "Causale",
        booking: "Prenotazione",
        uploadProof: "Carica prova di pagamento",
        uploadProofDesc: "La funzione per caricare la prova di pagamento sarà presto disponibile. Si prega di continuare senza caricare.",
        // Step 5
        reviewTitle: "Rivedi e completa la prenotazione",
        reviewDesc: "Controlla tutti i dettagli prima di inviare. Al termine, ti verrà inviata un'email di conferma.",
        almostDone: "Ci siamo quasi!",
        reviewCta: "Fai clic su \"Completa prenotazione\" per inviare i tuoi dati. Riceverai quindi un'email di conferma.",
        // Toasts
        toastMissingFieldsTitle: "Informazioni mancanti",
        toastMissingFieldsDesc: "Si prega di compilare tutti i campi obbligatori (*) nel primo passaggio.",
        toastErrorTitle: "Errore",
        toastErrorDesc: "Impossibile aggiornare la tua prenotazione. Per favore riprova.",
    },
};

const WizardStep = ({ current, step, name, completed }: { current: boolean, step: number, name: string, completed: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${completed ? 'bg-primary text-primary-foreground' : current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {completed ? <Check className="h-5 w-5" /> : step}
        </div>
        <span className={`text-xs text-center transition-colors ${completed ? 'text-primary font-semibold' : current ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{name}</span>
    </div>
);

export default function BookingCompletionForm({ booking, hotel }: { booking: Booking, hotel: Hotel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const lang = (booking.language || 'de') as keyof typeof translations;
  const t = translations[lang];
  const stepNames = t.steps;

  const [guestDetails, setGuestDetails] = useState<Partial<Guest>>({
    firstName: booking.guest.firstName,
    lastName: booking.guest.lastName,
    email: booking.guestDetails?.email || '',
    phone: booking.guestDetails?.phone || '',
    age: booking.guestDetails?.age || undefined,
  });
  const [notes, setNotes] = useState(booking.notes || '');
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>(booking.paymentOption || 'deposit');


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === 'notes') {
      setNotes(value);
    } else {
      setGuestDetails(prev => ({...prev, [id]: value}));
    }
  };

  const handleNext = () => {
    if (currentStep < stepNames.length) {
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
            title: t.toastMissingFieldsTitle,
            description: t.toastMissingFieldsDesc,
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
            title: t.toastErrorTitle,
            description: t.toastErrorDesc,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const nights = differenceInDays(booking.checkOut, booking.checkIn);
  const locale = locales[lang] || de;

  const renderStepContent = () => {
    switch (currentStep) {
        case 1: // Guest
            return (
                <div>
                    <h3 className="font-semibold mb-2">{t.guestDataTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.guestDataDesc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="flex items-center gap-1"><User className="h-3 w-3"/> {t.firstName} *</Label>
                            <Input id="firstName" value={guestDetails.firstName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="flex items-center gap-1"><User className="h-3 w-3"/> {t.lastName} *</Label>
                            <Input id="lastName" value={guestDetails.lastName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-1"><Mail className="h-3 w-3"/> {t.email} *</Label>
                            <Input id="email" type="email" placeholder="your.email@example.com" value={guestDetails.email} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-1"><Phone className="h-3 w-3"/> {t.phone} *</Label>
                            <Input id="phone" type="tel" placeholder="+49 123 456789" value={guestDetails.phone} onChange={handleInputChange}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="age">{t.age}</Label>
                            <Input id="age" type="number" placeholder="e.g. 30" value={guestDetails.age || ''} onChange={handleInputChange}/>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">{t.idDocs} *</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t.idDocsDesc}</p>
                        <RadioGroup defaultValue="later" className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="now" id="now" className="peer sr-only" disabled />
                                <Label htmlFor="now" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-not-allowed opacity-50">
                                    {t.uploadNow}
                                    <span className="text-xs text-muted-foreground">{t.uploadSoon}</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="later" id="later" className="peer sr-only" />
                                <Label htmlFor="later" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    {t.showOnSite}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="mt-6 space-y-4">
                        <h3 className="font-semibold">{t.notes}</h3>
                        <Textarea id="notes" placeholder="..." value={notes} onChange={handleInputChange} />
                    </div>
                </div>
            )
        case 2: // Companions
            return (
                 <div>
                    <h3 className="font-semibold mb-2">{t.companionsTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.companionsDesc}</p>
                    <div className="text-center p-8 bg-muted/50 rounded-lg">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h4 className="mt-4 text-lg font-semibold">{t.featureSoon}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{t.companionsSoon}</p>
                    </div>
                </div>
            )
        case 3: // Payment Option
            return (
                <div>
                    <h3 className="font-semibold mb-2">{t.paymentOptionTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.paymentOptionDesc}</p>
                    <RadioGroup value={paymentOption} onValueChange={(val: 'deposit' | 'full') => setPaymentOption(val)} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="deposit" id="deposit" className="peer sr-only" />
                            <Label htmlFor="deposit" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <span className="font-bold">{t.deposit}</span>
                                <span className="text-sm text-muted-foreground mt-1">{t.depositDesc}</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="full" id="full" className="peer sr-only" />
                            <Label htmlFor="full" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <span className="font-bold">{t.fullPayment}</span>
                                <span className="text-sm text-muted-foreground mt-1">{t.fullPaymentDesc}</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            )
        case 4: // Payment Details
             return (
                <div>
                    <h3 className="font-semibold mb-2">{t.paymentDetailsTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.paymentDetailsDesc}</p>
                    
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-base">{t.bankTransferTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>{t.accountHolder}:</strong> {hotel.bankDetails?.accountHolder || 'Nicht angegeben'}</p>
                            <p><strong>{t.iban}:</strong> {hotel.bankDetails?.iban || 'Nicht angegeben'}</p>
                            <p><strong>{t.bic}:</strong> {hotel.bankDetails?.bic || 'Nicht angegeben'}</p>
                             <p><strong>{t.bank}:</strong> {hotel.bankDetails?.bankName || 'Nicht angegeben'}</p>
                            <p className="font-bold pt-2"><strong>{t.purpose}:</strong> {t.booking} {booking.id?.substring(0, 6)}</p>
                        </CardContent>
                    </Card>

                     <div className="mt-6 text-center p-8 bg-muted/50 rounded-lg">
                        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h4 className="mt-4 text-lg font-semibold">{t.uploadProof}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{t.uploadProofDesc}</p>
                    </div>
                </div>
            )
        case 5: // Review
            return (
                <div>
                    <h3 className="font-semibold mb-2">{t.reviewTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.reviewDesc}</p>
                    <div className="text-center p-8 bg-muted/50 rounded-lg">
                        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h4 className="mt-4 text-lg font-semibold">{t.almostDone}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{t.reviewCta}</p>
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
            <h1 className="text-3xl font-headline font-bold text-center">{t.mainTitle}</h1>
            <p className="text-muted-foreground text-center">{t.step} {currentStep} {t.of} {stepNames.length}: {stepNames[currentStep - 1]}</p>
        </div>
        <div className="flex justify-center items-start mb-8">
            <div className="flex items-center w-full max-w-2xl">
                {stepNames.map((name, index) => (
                    <React.Fragment key={index}>
                        <WizardStep 
                            current={currentStep === index + 1} 
                            step={index + 1} 
                            name={name} 
                            completed={currentStep > index + 1}
                        />
                        {index < stepNames.length - 1 && <div className="flex-1 h-px bg-border mx-2"></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    {t.overviewTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4"/> {t.period}:</div>
                        <div>{format(booking.checkIn, 'dd.MM.yy', { locale })} - {format(booking.checkOut, 'dd.MM.yy', { locale })} ({nights} {t.nights})</div>

                        <div className="flex items-center gap-2 text-muted-foreground"><Bed className="h-4 w-4"/> {t.room}:</div>
                        <div>{booking.room.adults} {t.adults} {booking.room.children > 0 && `, ${booking.room.children} ${t.children}`}</div>
                        
                         <div className="flex items-center gap-2 text-muted-foreground"><Utensils className="h-4 w-4"/> {t.meal}:</div>
                        <div>{booking.mealType}</div>

                        <div className="flex items-center gap-2 text-muted-foreground font-semibold"><Euro className="h-4 w-4"/> {t.totalPrice}:</div>
                        <div className="font-semibold">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.totalPrice)}</div>

                    </div>
                </div>

                <div className="min-h-[350px]">
                    {renderStepContent()}
                </div>
                
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1 || isLoading}>
                {t.back}
                </Button>
                <Button onClick={handleNext} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentStep === stepNames.length ? t.submit : t.next}
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
