import Logo from '@/components/logo';
import { getHotel } from '@/lib/hotel-service';

export default async function GuestLayout({ children, params }: { children: React.ReactNode, params: { linkId: string } }) {
  // In a real app, the linkId would resolve to a booking which has a hotelId
  // For now, we hardcode the hotelId for styling the logo.
  const hotel = await getHotel('hotel_alpenrose');

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="p-4 flex justify-center border-b bg-background">
          <Logo hotelName={hotel?.name} logoUrl={hotel?.logoUrl} />
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {hotel?.name || 'Alpenlink Booking'}. Sichere Datenübermittlung.
      </footer>
    </div>
  );
}
