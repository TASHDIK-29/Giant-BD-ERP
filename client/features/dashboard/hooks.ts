'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboard } from './api';

export function useDashboard(
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'dashboard',
            refreshKey,
        ],

        queryFn: getDashboard,

        staleTime: 60 * 1000,
    });
}