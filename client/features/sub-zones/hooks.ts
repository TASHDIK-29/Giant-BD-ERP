'use client';

import { useQuery } from '@tanstack/react-query';
import { QuerySubZoneParams } from './type';
import { getSubZones } from './api';



export function useSubZone(
    params: QuerySubZoneParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'sub-zones',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getSubZones(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}