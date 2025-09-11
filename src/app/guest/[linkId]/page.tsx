import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Euro, Moon, Sun, Users } from 'lucide-react';
import BookingWizard from './_components/booking-wizard';

export default function GuestBookingPage({ params }: { params: { linkId: string } }) {
  return (
    <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <BookingWizard />
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-8">
                    <CardHeader>
                        <CardTitle className="font-headline">Ihre Buchung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> Zeitraum</span>
                            <span>10. Aug - 15. Aug 2024</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Moon className="h-4 w-4"/> Nächte</span>
                            <span>5</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/> Gäste</span>
                            <span>2 Erwachsene, 1 Kind</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Sun className="h-4 w-4"/> Verpflegung</span>
                            <span>Halbpension</span>
                        </div>
                        <Separator />
                         <div className="flex items-center justify-between font-bold text-lg">
                            <span className="flex items-center gap-2"><Euro className="h-5 w-5"/> Gesamtpreis</span>
                            <span>1.250,00 €</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
