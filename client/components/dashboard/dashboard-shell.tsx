'use client';

import { useState } from 'react';

import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';
import { DashboardPageHeader } from './dashboard-page-header';
// import { DashboardTopbar } from './dashboard-topbar';
// import { DashboardPageHeader } from './dashboard-page-header';

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
            {/* Sidebar */}
            <DashboardSidebar
                collapsed={sidebarCollapsed}
            />

            {/* Main area */}
            <div
                className={
                    sidebarCollapsed
                        ? 'ml-0 transition-all duration-300'
                        : 'ml-72 transition-all duration-300'
                }
            >
                {/* Fixed top navbar */}
                <DashboardTopbar
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={() =>
                        setSidebarCollapsed((previous) => !previous)
                    }
                />

                {/* Page area */}
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