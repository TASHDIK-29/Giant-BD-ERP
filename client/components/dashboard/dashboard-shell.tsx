'use client';

import { useEffect, useState } from 'react';

import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';
import { DashboardPageHeader } from './dashboard-page-header';

const SIDEBAR_STATE_KEY = 'sidebar-state';

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({
    children,
}: DashboardShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);



    const [sidebarReady, setSidebarReady] = useState(false);

    // Load sidebar state from localStorage
    useEffect(() => {
        const savedState =
            localStorage.getItem(
                SIDEBAR_STATE_KEY,
            );

        if (savedState !== null) {
            setSidebarCollapsed(
                savedState === 'true',
            );
        }

        setSidebarReady(true);
    }, []);

    // Save sidebar state whenever it changes
    useEffect(() => {
        if (!sidebarReady) {
            return;
        }

        localStorage.setItem(
            SIDEBAR_STATE_KEY,
            String(sidebarCollapsed),
        );
    }, [sidebarCollapsed, sidebarReady]);

    const toggleSidebar = () => {
        setSidebarCollapsed(
            (current) => !current,
        );
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <DashboardSidebar
                collapsed={sidebarCollapsed}
            />

            <div
                className={`transition-all duration-300 ${sidebarCollapsed
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