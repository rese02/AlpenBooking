

import Logo from '@/components/logo';
import { getHotel } from '@/lib/hotel-service';
import { notFound } from 'next/navigation';

export default async function GuestLayout({ children, params }: { children: React.ReactNode, params: { hotelId: string } }) {
  const hotel = await getHotel(params.hotelId);

  // hotel might be null if the ID is wrong, but the page itself will handle the 404
  // We still want to render the basic layout.

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      <header className="py-4 flex justify-center border-b bg-background sticky top-0 z-10">
          <Logo hotelName={hotel?.name} logoUrl={hotel?.logoUrl} />
      </header>
      <main className="flex-grow p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full">
          {children}
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {hotel?.name || 'Alpenlink Booking'}. Sichere Datenübermittlung.
      </footer>
    </div>
  );
}
