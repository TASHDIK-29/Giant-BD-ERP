'use client';

import {
    Bell,
    ChevronDown,
    Menu,
    Moon,
    Search,
    User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/auth-provider';

interface DashboardTopbarProps {
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
}

export function DashboardTopbar({
    onToggleSidebar,
}: DashboardTopbarProps) {

    const { session } = useAuth();

    const userName = session?.user?.name ?? '';
    const userEmail = session?.user?.email ?? '';

    const userInitial = userName
        .trim()
        .charAt(0)
        .toUpperCase();


    return (
        <header className=" left-0 right-0 top-0 z-40 h-16 border-b bg-background">
            <div className="flex h-full items-center justify-between px-4">
                {/* Sidebar toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className=""
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className='w-1/2 flex items-center justify-end gap-4'>


                    {/* Search */}
                    <div className="flex w-full max-w-90 items-center ">
                        <div className="relative w-full">
                            <Input
                                placeholder="Search..."
                                className="h-9 rounded-lg border-primary pr-10"
                            />

                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                        >
                            <Bell className="h-4 w-4" />

                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                                17
                            </span>
                        </Button>

                        {/* Theme */}
                        <Button
                            variant="ghost"
                            size="icon"
                        >
                            <Moon className="h-4 w-4" />
                        </Button>

                        {/* User */}
                        <Button
                            variant="outline"
                            className="h-9 gap-2 rounded-lg px-2"
                        >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </span>

                            <span className="text-sm font-normal">
                               {"SU"}
                            </span>

                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}