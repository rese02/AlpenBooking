import { Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export default function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="bg-primary/20 text-primary rounded-lg p-2">
        <Mountain className="h-6 w-6" />
      </div>
      {!iconOnly && (
        <span className="font-headline text-xl font-bold">Alpenlink Booking</span>
      )}
    </div>
  );
}
