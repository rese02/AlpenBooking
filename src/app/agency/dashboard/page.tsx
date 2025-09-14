

'use client';

import Link from 'next/link';
import React from 'react';
import {
  Copy,
  MoreHorizontal,
  PlusCircle,
  Settings,
  Trash2,
  UserCog,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getHotels, deleteHotel } from '@/lib/hotel-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Hotel } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HotelCredentialsDialog } from './_components/hotel-credentials-dialog';


export default function AgencyDashboardPage() {
  const [hotels, setHotels] = React.useState<Hotel[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [hotelToDelete, setHotelToDelete] = React.useState<Hotel | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = React.useState(false);
  const [selectedHotel, setSelectedHotel] = React.useState<Hotel | null>(null);


  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const fetchedHotels = await getHotels();
      setHotels(fetchedHotels);
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        setError('permission-denied');
      } else {
        console.error(e);
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHotels();
  }, []);

  const handleCopyLoginLink = (hotelId: string) => {
    const link = `${window.location.origin}/hotelier-login?hotelId=${hotelId}`;
     navigator.clipboard.writeText(link)
            .then(() => {
                toast({
                    title: 'Login-Link kopiert!',
                    description: 'Der spezielle Login-Link für dieses Hotel wurde in die Zwischenablage kopiert.',
                });
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                toast({
                    title: 'Fehler',
                    description: 'Der Link konnte nicht kopiert werden.',
                    variant: 'destructive',
                });
            });
  }

  const openDeleteDialog = (hotel: Hotel) => {
    setHotelToDelete(hotel);
    setIsAlertOpen(true);
  };
  
  const openCredentialsDialog = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsCredentialsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!hotelToDelete) return;
    setIsDeleting(true);
    try {
      await deleteHotel(hotelToDelete.id);
      toast({
        title: 'Hotel gelöscht',
        description: `Das Hotel "${hotelToDelete.name}" wurde erfolgreich gelöscht.`,
      });
      // Refresh hotel list
      setHotels(hotels.filter(h => h.id !== hotelToDelete.id));
    } catch (error) {
      console.error('Failed to delete hotel:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: 'Das Hotel konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setHotelToDelete(null);
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Hotelübersicht</CardTitle>
              <CardDescription>
                Verwalten Sie hier alle Ihre Kundenhotels.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="gap-1">
              <Link href="/agency/dashboard/create-hotel">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Neues Hotel erstellen
                </span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error === 'permission-denied' ? (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Aktion erforderlich: Firestore-Regeln aktualisieren</AlertTitle>
              <AlertDescription>
                <p>Der Zugriff auf die Datenbank wurde verweigert. Bitte aktualisieren Sie Ihre Firestore-Sicherheitsregeln in der Firebase-Konsole.</p>
                <p className="mt-2">Gehen Sie zu: <strong>Build &gt; Firestore Database &gt; Regeln</strong> und ersetzen Sie den Inhalt durch:</p>
                <pre className="mt-2 p-2 bg-muted rounded-md text-xs font-code">
                  {'rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}'}
                </pre>
                <p className="mt-2 text-xs text-muted-foreground">Hinweis: Diese Regel ist nur für die Entwicklung gedacht und nicht sicher für eine Produktionsumgebung.</p>
              </AlertDescription>
            </Alert>
          ) : error ? (
              <Alert variant="destructive">
                  <AlertTitle>Fehler</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          ) :(
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotelname</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Erstellungsdatum</TableHead>
                <TableHead>
                  <span className="sr-only">Aktionen</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                          Lade Hotels...
                      </TableCell>
                  </TableRow>
              ) : hotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Noch keine Hotels erstellt.
                  </TableCell>
                </TableRow>
              ) : (
                hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>{hotel.domain}</TableCell>
                    <TableCell>{hotel.createdAt.toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/hotel-dashboard/${hotel.id}`}>
                              <UserCog className="mr-2 h-4 w-4" /> Hotelier-Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openCredentialsDialog(hotel)}>
                            <KeyRound className="mr-2 h-4 w-4" /> Zugangsdaten anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" /> Hotel-Einstellungen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLoginLink(hotel.id)}>
                            <Copy className="mr-2 h-4 w-4" /> Login-Link kopieren
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(hotel)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Das Hotel "{hotelToDelete?.name}" wird dauerhaft gelöscht, einschließlich aller zugehörigen Buchungen und Daten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setIsAlertOpen(false)}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HotelCredentialsDialog
        isOpen={isCredentialsDialogOpen}
        onOpenChange={setIsCredentialsDialogOpen}
        hotel={selectedHotel}
      />
    </>
  );
}
