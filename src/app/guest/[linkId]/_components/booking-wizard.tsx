'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Banknote, CreditCard, FileUp, ShieldCheck, User, Users, Wallet } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const steps = [
  { id: 'gast', name: 'Gast', icon: User },
  { id: 'mitreiser', name: 'Mitreiser', icon: Users },
  { id: 'option', name: 'Option', icon: Wallet },
  { id: 'zahlung', name: 'Zahlung', icon: Banknote },
  { id: 'pruefung', name: 'Prüfung', icon: ShieldCheck },
];

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const params = useParams();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = () => {
    // In a real app, this would trigger the server action to save data.
    router.push(`/guest/${params.linkId}/thank-you`);
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-4">
          <ol className="flex items-center w-full">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${index <= currentStep ? 'text-primary after:border-primary' : 'text-muted-foreground after:border-border'}`}
              >
                <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${index <= currentStep ? 'bg-primary/20' : 'bg-muted'}`}>
                  <step.icon className="w-5 h-5" />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <CardTitle className="font-headline">{steps[currentStep].name}</CardTitle>
        <CardDescription>
          { currentStep === 0 && "Bitte geben Sie Ihre Kontaktdaten ein."}
          { currentStep === 1 && "Fügen Sie die Daten aller Mitreisenden hinzu."}
          { currentStep === 2 && "Wählen Sie Ihre bevorzugte Zahlungsoption."}
          { currentStep === 3 && "Tätigen Sie die Überweisung und laden Sie den Nachweis hoch."}
          { currentStep === 4 && "Bitte prüfen Sie alle Daten vor dem Absenden."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === 0 && <StepGuest />}
        {currentStep === 1 && <StepFellowTravelers />}
        {currentStep === 2 && <StepOption />}
        {currentStep === 3 && <StepPayment />}
        {currentStep === 4 && <StepReview />}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
          Zurück
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>Weiter</Button>
        ) : (
          <Button onClick={handleSubmit}>Daten absenden</Button>
        )}
      </CardFooter>
    </Card>
  );
}

const StepGuest = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input id="firstName" defaultValue="Max" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input id="lastName" defaultValue="Mustermann" />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" placeholder="max.mustermann@mail.com" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" placeholder="+49 123 456789" />
        </div>
        <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="upload-id" />
            <Label htmlFor="upload-id" className="text-sm font-normal">Ich möchte meine Ausweisdokumente jetzt hochladen (optional).</Label>
        </div>
    </div>
);

const StepFellowTravelers = () => (
    <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Daten für 1 weiteren Erwachsenen und 1 Kind.</p>
        <Card>
            <CardHeader><CardTitle className="text-base">Mitreisender 1 (Erwachsener)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Vorname</Label><Input />
                    </div>
                     <div className="space-y-2">
                        <Label>Nachname</Label><Input />
                    </div>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle className="text-base">Mitreisender 2 (Kind)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Vorname</Label><Input />
                    </div>
                     <div className="space-y-2">
                        <Label>Nachname</Label><Input />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

const StepOption = () => (
    <RadioGroup defaultValue="deposit" className="space-y-4">
        <Label>Wählen Sie eine Zahlungsoption:</Label>
        <div className="flex items-center space-x-2 border p-4 rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <RadioGroupItem value="deposit" id="deposit" />
            <Label htmlFor="deposit" className="font-normal w-full">
                <div className="flex justify-between items-center">
                    <span>Anzahlung (30%)</span>
                    <span className="font-bold">375,00 €</span>
                </div>
                <p className="text-xs text-muted-foreground">Der Restbetrag ist bei Anreise fällig.</p>
            </Label>
        </div>
        <div className="flex items-center space-x-2 border p-4 rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <RadioGroupItem value="full" id="full" />
             <Label htmlFor="full" className="font-normal w-full">
                <div className="flex justify-between items-center">
                    <span>Vollständige Zahlung</span>
                    <span className="font-bold">1.250,00 €</span>
                </div>
                <p className="text-xs text-muted-foreground">Bezahlen Sie den gesamten Betrag jetzt.</p>
            </Label>
        </div>
    </RadioGroup>
);

const StepPayment = () => (
    <div className="space-y-6">
        <div>
            <h3 className="font-semibold mb-2">1. Überweisung tätigen</h3>
            <p className="text-sm text-muted-foreground mb-4">Bitte überweisen Sie den Betrag von <strong>375,00 €</strong> auf das folgende Konto:</p>
            <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-2 text-sm">
                    <p><span className="font-semibold w-24 inline-block">Inhaber:</span> Hotel Alpenrose</p>
                    <p><span className="font-semibold w-24 inline-block">IBAN:</span> DE89 3704 0044 0532 0130 00</p>
                    <p><span className="font-semibold w-24 inline-block">BIC:</span> COBADEFFXXX</p>
                    <p><span className="font-semibold w-24 inline-block">Bank:</span> Commerzbank</p>
                </CardContent>
            </Card>
        </div>
         <div>
            <h3 className="font-semibold mb-2">2. Zahlungsnachweis hochladen</h3>
            <p className="text-sm text-muted-foreground mb-4">Laden Sie hier einen Screenshot oder ein PDF Ihrer Überweisungsbestätigung hoch.</p>
            <div className="relative border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <FileUp className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Klicken zum Hochladen oder Datei hierher ziehen</p>
                <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
        </div>
    </div>
);

const StepReview = () => (
     <div className="space-y-6">
        <p className="text-sm">Bitte überprüfen Sie Ihre Angaben. Nach dem Absenden wird Ihre Buchung verbindlich und Sie erhalten eine Bestätigungs-E-Mail.</p>
        <div className="space-y-2">
            <h4 className="font-semibold">Ihre Daten:</h4>
            <p className="text-sm text-muted-foreground">Max Mustermann, max.mustermann@mail.com, +49 123 456789</p>
        </div>
        <div className="space-y-2">
            <h4 className="font-semibold">Mitreisende:</h4>
            <p className="text-sm text-muted-foreground">1 Erwachsener, 1 Kind</p>
        </div>
         <div className="space-y-2">
            <h4 className="font-semibold">Zahlungsoption:</h4>
            <p className="text-sm text-muted-foreground">Anzahlung (30%) - 375,00 €</p>
        </div>
        <div className="flex items-center space-x-2 pt-4">
            <Checkbox id="terms" required />
            <Label htmlFor="terms" className="text-sm font-normal">Ich stimme den <a href="#" className="underline">Allgemeinen Geschäftsbedingungen</a> zu.</Label>
        </div>
    </div>
);
