

'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, KeyRound, Copy, Plus, Trash, Terminal, Loader2, Save } from 'lucide-react';
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
import { getHotel, updateHotel } from '@/lib/hotel-service';
import { useToast } from '@/hooks/use-toast';
import type { Hotel } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

export default function EditHotelPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.hotelId as string;
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Hotel>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hotelId) return;
    const fetchHotelData = async () => {
      setIsLoading(true);
      try {
        const hotelData = await getHotel(hotelId);
        if (hotelData) {
          setFormData({
            ...hotelData,
            hotelier: {
              ...hotelData.hotelier,
              password: 'placeholder-password-not-shown' // Don't show real password
            }
          });
          if (hotelData.logoUrl) {
            setLogoPreview(hotelData.logoUrl);
          }
        } else {
          setError('Hotel nicht gefunden.');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotelData();
  }, [hotelId]);


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
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleUpdateHotel = async () => {
    setError(null);
    if (!formData.name || !formData.domain) {
      toast({
        title: 'Fehlende Informationen',
        description: 'Bitte füllen Sie mindestens Hotelname und Domain aus.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { id, createdAt, hotelier, ...dataToUpdate } = formData;
      if (hotelier?.password === 'placeholder-password-not-shown') {
          delete hotelier.password;
      }
      const dataWithPotentiallyUpdatedHotelier = { ...dataToUpdate, hotelier };
      await updateHotel(hotelId, dataWithPotentiallyUpdatedHotelier, logoFile || undefined);
      toast({
        title: 'Hotel aktualisiert',
        description: `Die Daten für "${formData.name}" wurden erfolgreich gespeichert.`,
      });
      router.push('/agency/dashboard');
    } catch (error: any) {
      console.error('Error updating hotel:', error);
       if (error.code === 'storage/unknown' || error.code === 'storage/unauthorized') {
            setError('storage-permission-denied');
        } else {
             toast({
                title: 'Fehler beim Speichern',
                description: error.message || 'Das Hotel konnte nicht aktualisiert werden.',
                variant: 'destructive',
            });
        }
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Lade Hoteldaten...</p>
        </div>
    );
  }

  if (error && !isSaving) {
      return (
         <div className="flex h-screen w-full items-center justify-center">
            <Alert variant="destructive" className="max-w-lg">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-4">
                     <Button variant="outline" asChild>
                        <Link href="/agency/dashboard">Zurück zum Dashboard</Link>
                     </Button>
                </div>
              </AlertDescription>
            </Alert>
         </div>
      )
  }


  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/agency/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
          Hotel bearbeiten: {formData.name}
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agency/dashboard">Verwerfen</Link>
          </Button>
          <Button size="sm" onClick={handleUpdateHotel} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </Button>
        </div>
      </div>
      
       {error === 'storage-permission-denied' && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Aktion erforderlich: Firebase Storage Regeln aktualisieren</AlertTitle>
          <AlertDescription>
            <p>Der Logo-Upload wurde blockiert. Um Logos hochladen/ändern zu können, müssen Sie Ihre Firebase Storage Sicherheitsregeln anpassen.</p>
            <p className="mt-2">Gehen Sie zu Ihrer Firebase Konsole: <strong>Build &gt; Storage &gt; Regeln</strong> und ersetzen Sie den Inhalt durch:</p>
            <pre className="mt-2 p-2 bg-black/20 rounded-md text-xs font-code">
              {'rules_version = \'2\';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} {\n      allow read, write: if true;\n    }\n  }\n}'}
            </pre>
            <p className="mt-2 text-xs"><strong>Hinweis:</strong> Diese Regel ist nur für die Entwicklung gedacht. Nach der Änderung können Sie erneut speichern.</p>
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
                {logoPreview && (
                  <div className="w-24 h-24 relative">
                    <Image src={logoPreview} alt="Logo Vorschau" layout="fill" className="rounded-md object-cover" />
                  </div>
                )}
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
              <CardDescription>Zugangsdaten für den E-Mail-Versand im Namen des Hotels.</CardDescription>
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
                 <p className="text-xs text-muted-foreground">Hinweis: Für Gmail wird ein <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="underline">App-Passwort</a> benötigt.</p>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Hotelier-Zugang</CardTitle>
               <CardDescription>Die E-Mail kann nicht geändert werden. Ein neues Passwort kann in Firebase gesetzt werden.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="hotelier.email">E-Mail des Hoteliers</Label>
                <Input id="hotelier.email" type="email" value={formData.hotelier?.email || ''} readOnly disabled />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href="/agency/dashboard">Verwerfen</Link>
        </Button>
        <Button size="sm" onClick={handleUpdateHotel} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </Button>
      </div>
    </div>
  );
}
