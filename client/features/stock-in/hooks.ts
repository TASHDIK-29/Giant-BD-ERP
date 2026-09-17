'use client';

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import {
    createStockIn,
    getMasterProducts,
    getProductVariants,
    getRacks,
    getSubZones,
    getWarehouses,
    getZones,
} from './api';

export function useStockInMasterProducts() {
    return useQuery({
        queryKey: ['stockIn', 'masterProducts'],
        queryFn: getMasterProducts,
    });
}

export function useStockInVariants() {
    return useQuery({
        queryKey: ['stockIn', 'variants'],
        queryFn: getProductVariants,
    });
}

export function useStockInWarehouses() {
    return useQuery({
        queryKey: ['stockIn', 'warehouses'],
        queryFn: getWarehouses,
    });
}

export function useStockInZones() {
    return useQuery({
        queryKey: ['stockIn', 'zones'],
        queryFn: getZones,
    });
}

export function useStockInSubZones() {
    return useQuery({
        queryKey: ['stockIn', 'subZones'],
        queryFn: getSubZones,
    });
}

export function useStockInRacks() {
    return useQuery({
        queryKey: ['stockIn', 'racks'],
        queryFn: getRacks,
    });
}

export function useCreateStockIn() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: createStockIn,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['batchList'],
            });
        },
    });
}