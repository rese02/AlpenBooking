import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="font-headline text-3xl pt-4">Alpenlink Booking</CardTitle>
          <CardDescription>Das moderne Buchungssystem für Ihr Hotel.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <Button asChild className="w-full">
            <Link href="/agency/login">Agentur-Login</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/hotel/login">Hotel-Login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
