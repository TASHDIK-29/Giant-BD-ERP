'use client';

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import {
    createLetterOfCredit,
    createPurchaseOrder,
    createStockOut,
    getAvailableStockDetails,
    getBuyers,
    getMasterProducts,
    getStockInDetail,
    getStockInList,
    getVariants,
} from './api';

export function useStockOutBuyers() {
    return useQuery({
        queryKey: ['stockOutBuyers'],
        queryFn: getBuyers,
    });
}

export function useStockOutMasterProducts() {
    return useQuery({
        queryKey: ['stockOutMasterProducts'],
        queryFn: getMasterProducts,
    });
}

export function useStockOutVariants() {
    return useQuery({
        queryKey: ['stockOutVariants'],
        queryFn: getVariants,
    });
}

export function useStockOutStockInList() {
    return useQuery({
        queryKey: ['stockOutStockInList'],
        queryFn: getStockInList,
    });
}

export function useStockInDetail(
    stockInId: number,
    enabled = true,
) {
    return useQuery({
        queryKey: [
            'stockInDetail',
            stockInId,
        ],
        queryFn: () =>
            getStockInDetail(
                stockInId,
            ),
        enabled,
    });
}

export function useCreateLetterOfCredit() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createLetterOfCredit,

        onSuccess: async () => {
            await queryClient.invalidateQueries(
                {
                    queryKey: [
                        'stockOutBuyers',
                    ],
                },
            );
        },
    });
}

export function useCreatePurchaseOrder() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createPurchaseOrder,

        onSuccess: async () => {
            await queryClient.invalidateQueries(
                {
                    queryKey: [
                        'stockOutBuyers',
                    ],
                },
            );
        },
    });
}

export function useCreateStockOut() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: createStockOut,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['stockOut'],
            });
        },
    });
}


export function useAvailableStockDetails(
    batchIds: number[],
) {
    return useQuery({
        queryKey: [
            'stock-out-stock-details',
            batchIds,
        ],

        queryFn: () =>
            getAvailableStockDetails(batchIds),

        enabled: batchIds.length > 0,
    });
}