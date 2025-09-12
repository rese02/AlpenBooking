import { Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
  hotelName?: string;
  logoUrl?: string;
};

export default function Logo({ className, iconOnly = false, hotelName, logoUrl }: LogoProps) {
  const defaultName = "Alpenlink Booking";
  const name = hotelName || defaultName;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="bg-primary/20 text-primary rounded-lg p-1.5 shrink-0">
        {logoUrl ? (
             <Image src={logoUrl} alt={`${name} Logo`} width={28} height={28} className="rounded-md object-cover h-7 w-7" />
        ) : (
             <Mountain className="h-7 w-7" />
        )}
      </div>
      {!iconOnly && (
        <span className="font-headline text-xl font-bold truncate" title={name}>{name}</span>
      )}
    </div>
  );
}
