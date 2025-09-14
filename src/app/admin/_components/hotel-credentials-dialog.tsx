
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';
import type { Hotel } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface HotelCredentialsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  hotel: Hotel | null;
}

export function HotelCredentialsDialog({
  isOpen,
  onOpenChange,
  hotel,
}: HotelCredentialsDialogProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  if (!hotel) return null;

  const email = hotel.hotelier?.email || 'N/A';
  const password = hotel.hotelier?.password || 'N/A';

  const handleCopy = (field: 'email' | 'password', value: string) => {
    if (value === 'N/A') return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      toast({
        title: 'Kopiert!',
        description: `${field === 'email' ? 'E-Mail' : 'Passwort'} wurde in die Zwischenablage kopiert.`,
      });
      setTimeout(() => setCopiedField(null), 2000); // Reset icon after 2 seconds
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Zugangsdaten für {hotel.name}</DialogTitle>
          <DialogDescription>
            Diese Daten werden für den Login über die Hotel-Login-Seite benötigt.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Hotelier E-Mail</Label>
            <div className="flex items-center gap-2">
              <Input id="email" value={email} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy('email', email)}
              >
                {copiedField === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Passwort</Label>
            <div className="flex items-center gap-2">
              <Input id="password" type="password" value={password} readOnly />
               <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy('password', password)}
              >
                 {copiedField === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
