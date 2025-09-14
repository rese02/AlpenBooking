
'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Copy, Plus, Trash, Terminal } from 'lucide-react';
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
import type { Hotel } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

export default function CreateHotelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: '',
    domain: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    bankDetails: {
        accountHolder: '',
        iban: '',
        bic: '',
        bankName: '',
    },
    smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        user: '',
        pass: '',
    },
    hotelier: {
        email: '',
        password: '',
    },
    mealTypes: ['Frühstück'],
    roomCategories: ['Einzelzimmer', 'Doppelzimmer', 'Suite'],
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError(null);
    const { id, value } = e.target;
    const keys = id.split('.');
    if (keys.length > 1) {
        setFormData(prev => ({
            ...prev,
            [keys[0]]: {
                // @ts-ignore
                ...prev[keys[0]],
                [keys[1]]: keys[1] === 'port' ? parseInt(value, 10) : value
            }
        }))
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleMealTypeChange = (mealType: string) => {
    setFormData(prev => {
        const currentMealTypes = prev.mealTypes || [];
        const newMealTypes = currentMealTypes.includes(mealType)
            ? currentMealTypes.filter(m => m !== mealType)
            : [...currentMealTypes, mealType];
        return { ...prev, mealTypes: newMealTypes };
    });
  }

  const handleRoomCategoryChange = (index: number, value: string) => {
    const newCategories = [...(formData.roomCategories || [])];
    newCategories[index] = value;
    setFormData(prev => ({ ...prev, roomCategories: newCategories }));
  };

  const addRoomCategory = () => {
    setFormData(prev => ({ ...prev, roomCategories: [...(prev.roomCategories || []), ''] }));
  };

  const removeRoomCategory = (index: number) => {
    const newCategories = [...(formData.roomCategories || [])];
    newCategories.splice(index, 1);
    setFormData(prev => ({ ...prev, roomCategories: newCategories }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8);
    setFormData(prev => ({ ...prev, hotelier: { ...prev.hotelier!, password: newPassword }}));
    toast({
        title: 'Passwort generiert',
        description: 'Ein neues, sicheres Passwort wurde erstellt.'
    })
  };

  const copyCredentials = () => {
    if (!formData.hotelier?.email || !formData.hotelier?.password) {
        toast({
            title: 'Fehlende Daten',
            description: 'Bitte geben Sie eine E-Mail an und generieren Sie ein Passwort.',
            variant: 'destructive'
        });
        return;
    }
    const credentials = `E-Mail: ${formData.hotelier.email}\nPasswort: ${formData.hotelier.password}`;
    navigator.clipboard.writeText(credentials).then(() => {
        toast({
            title: 'Zugangsdaten kopiert!',
            description: 'E-Mail und Passwort wurden in die Zwischenablage kopiert.'
        })
    });
  }

  const handleCreateHotel = async () => {
    setError(null);
    if (!formData.name || !formData.domain) {
      toast({
        title: 'Fehlende Informationen',
        description: 'Bitte füllen Sie Hotelname und Domain aus.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const dataToSave = { ...formData };
      await createHotel(dataToSave as Omit<Hotel, 'id' | 'createdAt'>, logoFile || undefined);
      toast({
        title: 'Hotel erstellt',
        description: `Das Hotel "${formData.name}" wurde erfolgreich erstellt.`,
      });
      router.push('/admin');
    } catch (error: any) {
      console.error('Error creating hotel:', error);
       if (error.code === 'storage/unknown' || error.code === 'storage/unauthorized') {
            setError('storage-permission-denied');
        } else if (error.message.includes('invalid data')) {
            toast({
                title: 'Fehler bei den Daten',
                description: 'Einige der eingegebenen Daten sind ungültig. Bitte überprüfen Sie Ihre Eingaben.',
                variant: 'destructive',
            });
        }
        else {
             toast({
                title: 'Fehler',
                description: 'Das Hotel konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
                variant: 'destructive',
            });
        }
    } finally {
        setIsLoading(false);
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
          <Button size="sm" onClick={handleCreateHotel} disabled={isLoading}>
            {isLoading ? 'Wird erstellt...' : 'Hotel erstellen'}
          </Button>
        </div>
      </div>
      
       {error === 'storage-permission-denied' && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Aktion erforderlich: Firebase Storage Regeln aktualisieren</AlertTitle>
          <AlertDescription>
            <p>Der Logo-Upload wurde blockiert, daher wurde die Erstellung des Hotels abgebrochen. Um Hotels mit Logos erstellen zu können, müssen Sie Ihre Firebase Storage Sicherheitsregeln anpassen.</p>
            <p className="mt-2">Gehen Sie zu Ihrer Firebase Konsole: <strong>Build &gt; Storage &gt; Regeln</strong> und ersetzen Sie den Inhalt durch:</p>
            <pre className="mt-2 p-2 bg-black/20 rounded-md text-xs font-code">
              {'rules_version = \'2\';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} {\n      allow read, write: if true;\n    }\n  }\n}'}
            </pre>
            <p className="mt-2 text-xs"><strong>Hinweis:</strong> Diese Regel ist nur für die Entwicklung gedacht und erlaubt öffentliche Schreib- und Lesezugriffe. Nach der Änderung können Sie das Hotel erneut erstellen.</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Basisinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="name">Hotelname</Label>
                <Input id="name" type="text" className="w-full" placeholder="z.B. Hotel Alpenrose" value={formData.name || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" type="text" className="w-full" placeholder="z.B. alpenrose.alpen.link" value={formData.domain || ''} onChange={handleInputChange} />
              </div>
               <div className="grid gap-3">
                <Label htmlFor="logo">Logo</Label>
                <Input id="logo" type="file" className="w-full" onChange={handleFileChange} accept="image/*" />
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
                <Input id="contactEmail" type="email" placeholder="info@hotel.com" value={formData.contactEmail || ''} onChange={handleInputChange} />
              </div>
               <div className="grid gap-3">
                <Label htmlFor="contactPhone">Kontakt Telefon</Label>
                <Input id="contactPhone" type="tel" placeholder="+49 123 456789" value={formData.contactPhone || ''} onChange={handleInputChange} />
              </div>
               <div className="grid gap-3">
                <Label htmlFor="address">Adresse</Label>
                <Textarea id="address" placeholder="Musterstraße 1, 12345 Musterstadt, Deutschland" value={formData.address || ''} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Buchungskonfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="mb-2 block">Verpflegungsarten</Label>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {['Frühstück', 'Halbpension', 'Vollpension', 'Ohne Verpflegung'].map(meal => (
                            <div key={meal} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`meal-${meal}`}
                                    checked={formData.mealTypes?.includes(meal)}
                                    onCheckedChange={() => handleMealTypeChange(meal)}
                                />
                                <label htmlFor={`meal-${meal}`} className="text-sm font-medium leading-none">
                                    {meal}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <Label className="mb-2 block">Zimmerkategorien</Label>
                    <div className="space-y-2">
                        {formData.roomCategories?.map((category, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={category}
                                    onChange={(e) => handleRoomCategoryChange(index, e.target.value)}
                                    placeholder="z.B. Doppelzimmer"
                                />
                                <Button variant="destructive" size="icon" onClick={() => removeRoomCategory(index)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={addRoomCategory}>
                        <Plus className="mr-2 h-4 w-4" /> Kategorie hinzufügen
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4">
             <Card>
                <CardHeader>
                <CardTitle className="font-headline">Bankverbindung</CardTitle>
                <CardDescription>Wird Gästen für die Zahlungsanweisungen angezeigt.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid gap-3">
                    <Label htmlFor="bankDetails.accountHolder">Kontoinhaber</Label>
                    <Input id="bankDetails.accountHolder" type="text" value={formData.bankDetails?.accountHolder || ''} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                    <Label htmlFor="bankDetails.iban">IBAN</Label>
                    <Input id="bankDetails.iban" type="text" value={formData.bankDetails?.iban || ''} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-3">
                    <Label htmlFor="bankDetails.bic">BIC</Label>
                    <Input id="bankDetails.bic" type="text" value={formData.bankDetails?.bic || ''} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="bankDetails.bankName">Bankname</Label>
                    <Input id="bankDetails.bankName" type="text" value={formData.bankDetails?.bankName || ''} onChange={handleInputChange} />
                </div>
                </CardContent>
            </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">E-Mail-Versand (SMTP)</CardTitle>
              <CardDescription>Zugangsdaten für den E-Mail-Versand im Namen des Hotels. Für Gmail voreingestellt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="smtp.host">SMTP Host</Label>
                    <Input id="smtp.host" type="text" value={formData.smtp?.host || ''} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="smtp.port">SMTP Port</Label>
                    <Input id="smtp.port" type="number" value={formData.smtp?.port || ''} onChange={handleInputChange} />
                  </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="smtp.user">Benutzer (E-Mail)</Label>
                <Input id="smtp.user" type="text" value={formData.smtp?.user || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="smtp.pass">App-Passwort</Label>
                <Input id="smtp.pass" type="password" value={formData.smtp?.pass || ''} onChange={handleInputChange} />
                 <p className="text-xs text-muted-foreground">Hinweis: Hier wird ein <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="underline">Google App-Passwort</a> benötigt, nicht das normale E-Mail-Passwort.</p>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Hotelier-Zugang</CardTitle>
               <CardDescription>Der Hotelier erhält eine separate E-Mail zur Accounterstellung.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="hotelier.email">E-Mail des Hoteliers</Label>
                <Input id="hotelier.email" type="email" placeholder="hotelier@mail.com" value={formData.hotelier?.email || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="hotelier.password">Passwort</Label>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={generatePassword}><KeyRound className="h-4 w-4"/></Button>
                    <Input id="hotelier.password" type="text" readOnly value={formData.hotelier?.password || ''} placeholder="Passwort generieren..." />
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full" onClick={copyCredentials}>
                <Copy className="mr-2 h-4 w-4" />
                Zugangsdaten kopieren
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">Verwerfen</Link>
        </Button>
        <Button size="sm" onClick={handleCreateHotel} disabled={isLoading}>
            {isLoading ? 'Wird erstellt...' : 'Hotel erstellen'}
        </Button>
      </div>
    </div>
  );
}
