'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createZone, getZones } from './api';
import { QueryZoneParams } from './type';
// import { QueryWarehouseParams } from './type';



export function useZone(
    params: QueryZoneParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'zones',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getZones(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}





export function useCreateZone() {
    return useMutation({
        mutationFn:
            createZone,
    });
}