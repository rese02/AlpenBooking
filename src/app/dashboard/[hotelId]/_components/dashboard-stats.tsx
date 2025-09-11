'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, BookOpen, UserPlus, AlertTriangle } from 'lucide-react';
import React from 'react';

const stats = [
    { title: "Gesamtumsatz", value: "€45,231.89", icon: DollarSign, change: "+20.1% from last month" },
    { title: "Gesamtbuchungen", value: "+2350", icon: BookOpen, change: "+180.1% from last month" },
    { title: "Heutige Anreisen", value: "+12", icon: UserPlus, change: "+19% from last month" },
    { title: "Ausstehende Aktionen", value: "3", icon: AlertTriangle, change: "+2 since last hour" },
];

export default function DashboardStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
