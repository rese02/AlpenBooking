import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="items-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="font-headline text-2xl">Vielen Dank für Ihre Buchung!</p>
                    <CardDescription>
                        Ihre Daten wurden erfolgreich übermittelt. Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                        <p className="font-semibold">Buchungszusammenfassung</p>
                        <p><strong>Hotel:</strong> Hotel Alpenrose</p>
                        <p><strong>Zeitraum:</strong> 10. Aug 2024 - 15. Aug 2024</p>
                        <p><strong>Gast:</strong> Max Mustermann</p>
                    </div>
                    <Button asChild className="mt-6">
                        <Link href="/">Zur Startseite</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
