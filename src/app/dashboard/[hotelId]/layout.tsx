
'use client';

import Link from 'next/link';
import {
  Bell,
  BookMarked,
  Home,
  LineChart,
  LogOut,
  Package,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/logo';
import { getHotel } from '@/lib/hotel-service';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import type { Hotel } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/auth/protected-route';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardLayoutContent({
  children
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { hotelId } = params as { hotelId: string };
  const { logout } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchHotel() {
      if (!hotelId) return;
      try {
        const hotelData = await getHotel(hotelId);
        if (!hotelData) {
          setError(true);
        } else {
          setHotel(hotelData);
        }
      } catch (error) {
        console.error("Failed to fetch hotel", error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHotel();
  }, [hotelId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Lade Hotel-Dashboard...</p>
      </div>
    );
  }
  
  if (error || !hotel) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Hotel nicht gefunden.</p>
        </div>
     );
  }

  const navLinks = [
    {
      href: `/dashboard/${hotelId}`,
      icon: Home,
      label: 'Dashboard',
    },
    {
      href: `/dashboard/${hotelId}/bookings`,
      icon: BookMarked,
      label: 'Buchungen',
    },
    {
      href: '#', // Placeholder for future settings page
      icon: Settings,
      label: 'Einstellungen',
    },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo hotelName={hotel.name} logoUrl={hotel.logoUrl} />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Logo hotelName={hotel.name} logoUrl={hotel.logoUrl} />
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Einstellungen</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const hotelId = params.hotelId as string;

  return (
    <ProtectedRoute requiredRole="hotelier" requiredHotelId={hotelId} loginPath={`/hotel/login`}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}
