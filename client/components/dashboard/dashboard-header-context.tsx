'use client';

import {
    createContext,
    useContext,
    useMemo,
    useState,
} from 'react';

interface DashboardHeaderContextValue {
    searchValue: string;
    setSearchValue: (value: string) => void;

    refreshKey: number;
    triggerRefresh: () => void;
}

const DashboardHeaderContext =
    createContext<DashboardHeaderContextValue | null>(
        null,
    );

export function DashboardHeaderProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [searchValue, setSearchValue] =
        useState('');

    const [refreshKey, setRefreshKey] =
        useState(0);

    const triggerRefresh = () => {
        setRefreshKey(
            (current) => current + 1,
        );
    };

    const value = useMemo(
        () => ({
            searchValue,
            setSearchValue,
            refreshKey,
            triggerRefresh,
        }),
        [searchValue, refreshKey],
    );

    return (
        <DashboardHeaderContext.Provider
            value={value}
        >
            {children}
        </DashboardHeaderContext.Provider>
    );
}

export function useDashboardHeader() {
    const context = useContext(
        DashboardHeaderContext,
    );

    if (!context) {
        throw new Error(
            'useDashboardHeader must be used inside DashboardHeaderProvider',
        );
    }

    return context;
}