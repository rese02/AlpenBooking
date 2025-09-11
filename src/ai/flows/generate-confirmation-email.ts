'use server';

/**
 * @fileOverview An AI agent which generates a professional confirmation email and sends it to the guest automatically once the booking process is done.
 *
 * - generateConfirmationEmail - A function that generates the confirmation email.
 * - GenerateConfirmationEmailInput - The input type for the generateConfirmationEmail function.
 * - GenerateConfirmationEmailOutput - The return type for the generateConfirmationEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConfirmationEmailInputSchema = z.object({
  guestFirstName: z.string().describe('The first name of the guest.'),
  guestLastName: z.string().describe('The last name of the guest.'),
  hotelName: z.string().describe('The name of the hotel.'),
  checkInDate: z.string().describe('The check-in date.'),
  checkOutDate: z.string().describe('The check-out date.'),
  roomType: z.string().describe('The type of room booked.'),
  totalPrice: z.number().describe('The total price of the booking.'),
  hotelContactEmail: z.string().describe('The contact email of the hotel.'),
  hotelContactPhone: z.string().describe('The contact phone of the hotel.'),
  hotelAddress: z.string().describe('The address of the hotel.'),
  bookingId: z.string().describe('The unique identifier for the booking.'),
});
export type GenerateConfirmationEmailInput = z.infer<
  typeof GenerateConfirmationEmailInputSchema
>;

const GenerateConfirmationEmailOutputSchema = z.object({
  confirmationEmail: z.string().describe('The generated confirmation email.'),
});
export type GenerateConfirmationEmailOutput = z.infer<
  typeof GenerateConfirmationEmailOutputSchema
>;

export async function generateConfirmationEmail(
  input: GenerateConfirmationEmailInput
): Promise<GenerateConfirmationEmailOutput> {
  return generateConfirmationEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConfirmationEmailPrompt',
  input: {schema: GenerateConfirmationEmailInputSchema},
  output: {schema: GenerateConfirmationEmailOutputSchema},
  prompt: `You are an AI assistant specialized in generating professional confirmation emails for hotel bookings.

  Given the following information, generate a confirmation email to be sent to the guest.

  Guest First Name: {{{guestFirstName}}}
  Guest Last Name: {{{guestLastName}}}
  Hotel Name: {{{hotelName}}}
  Check-in Date: {{{checkInDate}}}
  Check-out Date: {{{checkOutDate}}}
  Room Type: {{{roomType}}}
  Total Price: {{{totalPrice}}}
  Hotel Contact Email: {{{hotelContactEmail}}}
  Hotel Contact Phone: {{{hotelContactPhone}}}
  Hotel Address: {{{hotelAddress}}}
 Booking ID: {{{bookingId}}}

  The email should be professional, friendly, and contain all the necessary information for the guest regarding their booking.
`,
});

const generateConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'generateConfirmationEmailFlow',
    inputSchema: GenerateConfirmationEmailInputSchema,
    outputSchema: GenerateConfirmationEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
