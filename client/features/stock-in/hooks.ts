'use client';

import {
    useMutation,
    useQuery,
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
    return useMutation({
        mutationFn: createStockIn,
    });
}