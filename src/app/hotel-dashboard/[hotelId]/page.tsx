import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import DashboardStats from "./_components/dashboard-stats";
import RecentActivities from "./_components/recent-activities";
import BookingCalendar from "./_components/booking-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHotel } from "@/lib/hotel-service";
import { notFound } from "next/navigation";

export default async function HotelDashboardPage({ params }: { params: { hotelId: string } }) {
  const hotel = await getHotel(params.hotelId);
  if (!hotel) {
    notFound();
  }
  return (
    <>
      <PageHeader title="Dashboard">
        <Button size="sm" asChild>
          <Link href={`/hotel-dashboard/${params.hotelId}/bookings/create`}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Neue Buchung
          </Link>
        </Button>
      </PageHeader>
      
      <DashboardStats hotelId={params.hotelId} />

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Systemstatus</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Datenbank</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span>KI-Dienste</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Speicher</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span>E-Mail Versand</span>
                </div>
            </CardContent>
          </Card>
          <RecentActivities hotelId={params.hotelId} />
        </div>
        <div className="row-start-1 xl:row-start-auto">
          <BookingCalendar />
        </div>
      </div>
    </>
  );
}
