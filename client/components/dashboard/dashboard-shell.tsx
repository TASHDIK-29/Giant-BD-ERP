'use client';

import { useState } from 'react';

import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';
import { DashboardPageHeader } from './dashboard-page-header';

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({
    children,
}: DashboardShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    return (
        <div className="min-h-screen bg-muted/30">
            <DashboardSidebar
                collapsed={sidebarCollapsed}
            />

            <div
                className={`transition-all duration-300 ${
                    sidebarCollapsed
                        ? 'ml-20'
                        : 'ml-72'
                }`}
            >
                <DashboardTopbar
                    sidebarCollapsed={
                        sidebarCollapsed
                    }
                    onToggleSidebar={() =>
                        setSidebarCollapsed(
                            (current) => !current,
                        )
                    }
                />

                <main className="min-h-screen">
                    <div className="p-4 md:p-6">
                        <DashboardPageHeader />

                        <div className="mt-5">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}