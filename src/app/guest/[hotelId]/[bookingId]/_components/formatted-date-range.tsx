
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';

type FormattedDateRangeProps = {
    from: Date;
    to: Date;
    locale: Locale;
    nights: number;
    nightsLabel: string;
}

export default function FormattedDateRange({ from, to, locale, nights, nightsLabel }: FormattedDateRangeProps) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        // This code runs only on the client, after hydration
        const fromDate = new Date(from);
        const toDate = new Date(to);
        setFormattedDate(`${format(fromDate, 'dd.MM.yy', { locale })} - ${format(toDate, 'dd.MM.yy', { locale })} (${nights} ${nightsLabel})`);
    }, [from, to, locale, nights, nightsLabel]);

    return (
        <div className="col-span-3">{formattedDate || '...'}</div>
    );
}

    
    