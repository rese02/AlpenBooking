export type Hotel = {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  logoUrl?: string;
};

export type BookingStatus = 'Sent' | 'Partial Payment' | 'Confirmed' | 'Cancelled';

export type Guest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type Booking = {
  id: string;
  guest: Pick<Guest, 'firstName' | 'lastName'>;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  totalPrice: number;
  lastChanged: Date;
  guestDetails?: Guest;
  room: {
    type: string;
    adults: number;
    children: number;
  };
  mealType: string;
};
