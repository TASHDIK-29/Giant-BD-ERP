'use client';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';




export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthProvider>
            <DashboardShell>
                {children}
            </DashboardShell>
        </AuthProvider>
    );
}