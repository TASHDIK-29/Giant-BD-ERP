'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ChevronDown,
    ChevronUp,
    Loader2,
    Minus,
    Plus,
    RotateCcw,
    Trash2,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import {
    useAvailableStockDetails,
    useCreateLetterOfCredit,
    useCreatePurchaseOrder,
    useCreateStockOut,
    useStockInDetail,
    useStockOutBuyers,
    useStockOutMasterProducts,
    useStockOutStockInList,
    useStockOutVariants,
} from '../hooks';

import {
    DispatchItem,
    Gender,
    StockInItem,
} from '../types';

const inputClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

const labelClass =
    'mb-1.5 block text-sm font-medium text-slate-800';

function today() {
    return new Date()
        .toISOString()
        .split('T')[0];
}

function genderLabel(gender: Gender) {
    switch (gender) {
        case 'FEMALE':
            return 'Lady';

        case 'MALE':
            return 'Male';

        default:
            return gender;
    }
}

function getAging(
    stockInDate: string,
) {
    const start =
        new Date(stockInDate).getTime();

    const now =
        new Date().getTime();

    const days = Math.floor(
        (now - start) /
        (1000 * 60 * 60 * 24),
    );

    if (days <= 30) {
        return {
            label: 'GREEN',
            className:
                'bg-emerald-50 text-emerald-700',
        };
    }

    if (days <= 90) {
        return {
            label: 'MEDIUM',
            className:
                'bg-amber-50 text-amber-700',
        };
    }

    return {
        label: 'OLD',
        className:
            'bg-rose-50 text-rose-700',
    };
}

export function StockOutForm() {
    const router = useRouter();

    const [basicOpen, setBasicOpen] =
        useState(true);

    /* Dedicated states for Create LC / PO Section */
    const [createLcBuyerId, setCreateLcBuyerId] = useState('');
    const [createPoLcId, setCreatePoLcId] = useState('');

    const [buyerId, setBuyerId] =
        useState('');

    const [lcId, setLcId] =
        useState('');

    const [poId, setPoId] =
        useState('');

    const [newLcNumber, setNewLcNumber] =
        useState('');

    const [newPoNumber, setNewPoNumber] =
        useState('');

    const [
        masterProductId,
        setMasterProductId,
    ] = useState('');

    const [colorId, setColorId] =
        useState('');

    const [gender, setGender] =
        useState<Gender | ''>('');

    const [
        requestDate,
        setRequestDate,
    ] = useState(today());

    const [
        stockOutDate,
        setStockOutDate,
    ] = useState(today());

    const [dispatchItems, setDispatchItems] =
        useState<DispatchItem[]>([]);

    const [issueQuantities, setIssueQuantities] =
        useState<Record<string, number>>({});

    const [error, setError] =
        useState('');

    const {
        data: buyers = [],
        isLoading: buyersLoading,
    } = useStockOutBuyers();

    const {
        data: masterProducts = [],
        isLoading: masterProductsLoading,
    } = useStockOutMasterProducts();

    const {
        data: variants = [],
        isLoading: variantsLoading,
    } = useStockOutVariants();

    const {
        data: stockInResponse,
        isLoading: stockInLoading,
    } = useStockOutStockInList();

    const createLcMutation =
        useCreateLetterOfCredit();

    const createPoMutation =
        useCreatePurchaseOrder();

    const createStockOutMutation =
        useCreateStockOut();

    /*
     * All stock-in batches.
     */
    const stockInBatches =
        stockInResponse?.data ?? [];

    /*
     * Flattened list of ALL available LCs across all active buyers
     */
    const allAvailableLcs = useMemo(() => {
        return buyers
            .filter((buyer) => buyer.status === 'ACTIVE')
            .flatMap((buyer) => buyer.lettersOfCredit ?? []);
    }, [buyers]);

    /*
     * Selected LC found from all available LCs
     */
    const selectedLc = useMemo(() => {
        if (!lcId) return undefined;
        return allAvailableLcs.find((lc) => lc.id === Number(lcId));
    }, [allAvailableLcs, lcId]);

    /*
     * Selected Buyer found directly based on selected LC
     */
    const selectedBuyer = useMemo(() => {
        if (!lcId) return undefined;
        return buyers.find((buyer) =>
            buyer.lettersOfCredit?.some((lc) => lc.id === Number(lcId)),
        );
    }, [buyers, lcId]);

    /*
     * Available POs belonging strictly to the selected LC
     */
    const availablePos = selectedLc?.purchaseOrders ?? [];

    /*
     * Available LCs for Create PO section dropdown based on selected Create LC Buyer
     */
    const createPoAvailableLcs = useMemo(() => {
        if (!createLcBuyerId) return [];
        return (
            buyers.find((buyer) => buyer.id === Number(createLcBuyerId))
                ?.lettersOfCredit ?? []
        );
    }, [buyers, createLcBuyerId]);

    /*
     * Master product variants.
     */
    const masterVariants =
        useMemo(() => {
            if (!masterProductId) {
                return [];
            }

            return variants.filter(
                (variant) =>
                    variant.masterProductId ===
                    Number(
                        masterProductId,
                    ),
            );
        }, [
            variants,
            masterProductId,
        ]);

    /*
     * Colors for master.
     */
    const availableColors =
        useMemo(() => {
            const map = new Map<
                number,
                {
                    id: number;
                    name: string;
                }
            >();

            masterVariants.forEach(
                (variant) => {
                    if (
                        !map.has(
                            variant.colorId,
                        )
                    ) {
                        map.set(
                            variant.colorId,
                            variant.color,
                        );
                    }
                },
            );

            return Array.from(
                map.values(),
            );
        }, [masterVariants]);

    /*
     * Genders for master + color.
     */
    const availableGenders =
        useMemo(() => {
            const result =
                new Set<Gender>();

            masterVariants
                .filter(
                    (variant) =>
                        !colorId ||
                        variant.colorId ===
                        Number(
                            colorId,
                        ),
                )
                .forEach(
                    (variant) => {
                        result.add(
                            variant.gender,
                        );
                    },
                );

            return Array.from(
                result,
            );
        }, [
            masterVariants,
            colorId,
        ]);

    /*
     * Actual selected variants.
     */
    const selectedVariants =
        useMemo(() => {
            if (
                !masterProductId ||
                !colorId ||
                !gender
            ) {
                return [];
            }

            return variants.filter(
                (variant) =>
                    variant.masterProductId ===
                    Number(
                        masterProductId,
                    ) &&
                    variant.colorId ===
                    Number(colorId) &&
                    variant.gender ===
                    gender,
            );
        }, [
            variants,
            masterProductId,
            colorId,
            gender,
        ]);

    /*
     * One variant per size.
     */
    const availableSizes =
        useMemo(() => {
            const map = new Map<
                string,
                (typeof selectedVariants)[number]
            >();

            selectedVariants.forEach(
                (variant) => {
                    map.set(
                        variant.size,
                        variant,
                    );
                },
            );

            return Array.from(
                map.values(),
            );
        }, [selectedVariants]);

    /*
     * Selected master product.
     */
    const selectedMasterProduct =
        useMemo(
            () =>
                masterProducts.find(
                    (product) =>
                        product.id ===
                        Number(
                            masterProductId,
                        ),
                ),
            [
                masterProducts,
                masterProductId,
            ],
        );

    /*
     * Relevant Batch IDs.
     */
    const relevantBatchIds =
        useMemo(() => {
            if (
                !masterProductId ||
                !colorId ||
                !gender
            ) {
                return [];
            }

            return stockInBatches
                .filter(
                    (batch) =>
                        batch.masterProductId ===
                        Number(
                            masterProductId,
                        ) &&
                        batch.colorId ===
                        Number(colorId) &&
                        batch.gender ===
                        gender,
                )
                .map(
                    (batch) =>
                        batch.id,
                );
        }, [
            stockInBatches,
            masterProductId,
            colorId,
            gender,
        ]);

    const {
        data: stockDetails = {},
        isLoading: stockDetailsLoading,
    } =
        useAvailableStockDetails(
            relevantBatchIds,
        );

    const stockRows =
        useMemo(() => {
            if (
                selectedVariants.length === 0
            ) {
                return [];
            }

            const variantIds = new Set(
                selectedVariants.map(
                    (variant) => variant.id,
                ),
            );

            const rows: Array<{
                batchId: string;
                stockInDate: string;
                item: StockInItem;
            }> = [];

            stockInBatches
                .filter((batch) =>
                    relevantBatchIds.includes(
                        batch.id,
                    ),
                )
                .forEach((batch) => {
                    const items =
                        stockDetails[
                        batch.id
                        ] ?? [];

                    items
                        .filter((item) =>
                            variantIds.has(
                                item.productVariantId,
                            ),
                        )
                        .forEach((item) => {
                            rows.push({
                                batchId:
                                    batch.batchId,
                                stockInDate:
                                    batch.stockInDate,
                                item,
                            });
                        });
                });

            return rows;
        }, [
            selectedVariants,
            stockInBatches,
            stockDetails,
            relevantBatchIds,
        ]);

    /*
     * Reset.
     */
    const handleReset = () => {
        setBuyerId('');
        setLcId('');
        setPoId('');

        setCreateLcBuyerId('');
        setCreatePoLcId('');
        setNewLcNumber('');
        setNewPoNumber('');

        setMasterProductId('');
        setColorId('');
        setGender('');

        setRequestDate(today());
        setStockOutDate(today());

        setDispatchItems([]);
        setIssueQuantities({});

        setError('');
    };

    /*
     * LC changed in Basic Information.
     * Automatically syncs and fills Buyer ID.
     */
    const handleLcChange = (value: string) => {
        setLcId(value);
        setPoId('');
        setError('');

        if (value) {
            const foundBuyer = buyers.find((buyer) =>
                buyer.lettersOfCredit?.some((lc) => lc.id === Number(value)),
            );
            if (foundBuyer) {
                setBuyerId(String(foundBuyer.id));
            } else {
                setBuyerId('');
            }
        } else {
            setBuyerId('');
        }
    };

    /*
     * Master changed.
     */
    const handleMasterChange = (
        value: string,
    ) => {
        setMasterProductId(value);
        setColorId('');
        setGender('');

        setDispatchItems([]);
        setIssueQuantities({});

        setError('');
    };

    /*
     * Color changed.
     */
    const handleColorChange = (
        value: string,
    ) => {
        setColorId(value);
        setGender('');

        setDispatchItems([]);
        setIssueQuantities({});

        setError('');
    };

    /*
     * Gender changed.
     */
    const handleGenderChange = (
        value: Gender,
    ) => {
        setGender(value);

        setDispatchItems([]);
        setIssueQuantities({});

        setError('');
    };

    /*
     * Create LC.
     */
    const handleCreateLc =
        async () => {
            setError('');

            if (!createLcBuyerId) {
                setError(
                    'Please select a Buyer before creating an LC.',
                );
                return;
            }

            if (!newLcNumber.trim()) {
                setError(
                    'Please enter LC No.',
                );
                return;
            }

            try {
                await createLcMutation.mutateAsync(
                    {
                        buyerId:
                            Number(
                                createLcBuyerId,
                            ),
                        lcNumber:
                            newLcNumber.trim(),
                    },
                );

                setNewLcNumber('');
            } catch (error: any) {
                setError(
                    error?.response
                        ?.data?.message ||
                    error?.message ||
                    'Failed to create LC.',
                );
            }
        };

    /*
     * Create PO.
     */
    const handleCreatePo =
        async () => {
            setError('');

            if (!createPoLcId) {
                setError(
                    'Please select an LC before creating a PO.',
                );
                return;
            }

            if (!newPoNumber.trim()) {
                setError(
                    'Please enter PO No.',
                );
                return;
            }

            try {
                await createPoMutation.mutateAsync(
                    {
                        letterOfCreditId:
                            Number(
                                createPoLcId,
                            ),
                        poNumber:
                            newPoNumber.trim(),
                    },
                );

                setNewPoNumber('');
            } catch (error: any) {
                setError(
                    error?.response
                        ?.data?.message ||
                    error?.message ||
                    'Failed to create PO.',
                );
            }
        };

    /*
     * Increase issue quantity.
     */
    const increaseIssueQuantity = (
        key: string,
        available: number,
    ) => {
        setIssueQuantities(
            (current) => ({
                ...current,
                [key]: Math.min(
                    (current[key] ?? 0) +
                    1,
                    available,
                ),
            }),
        );
    };

    /*
     * Decrease issue quantity.
     */
    const decreaseIssueQuantity = (
        key: string,
    ) => {
        setIssueQuantities(
            (current) => {
                const next =
                    Math.max(
                        (current[key] ??
                            0) - 1,
                        0,
                    );

                return {
                    ...current,
                    [key]: next,
                };
            },
        );
    };

    /*
     * Direct quantity input.
     */
    const changeIssueQuantity = (
        key: string,
        value: number,
        available: number,
    ) => {
        setIssueQuantities(
            (current) => ({
                ...current,
                [key]: Math.min(
                    Math.max(
                        Number.isFinite(
                            value,
                        )
                            ? value
                            : 0,
                        0,
                    ),
                    available,
                ),
            }),
        );
    };

    /*
     * Add stock record to dispatch.
     */
    const addToDispatch = (
        batchId: string,
        item: StockInItem,
        stockInDate: string,
    ) => {
        const key = `${batchId}-${item.productVariantId}-${item.id}`;

        const quantity =
            issueQuantities[key] ?? 0;

        if (quantity < 1) {
            setError(
                `Please enter issue quantity for size ${item.productVariant.size}.`,
            );
            return;
        }

        const existing =
            dispatchItems.find(
                (dispatch) =>
                    dispatch.id ===
                    key,
            );

        if (existing) {
            setError(
                'This stock record has already been added to dispatch.',
            );
            return;
        }

        setDispatchItems(
            (current) => [
                ...current,
                {
                    id: key,
                    batchId,
                    productVariantId:
                        item.productVariantId,
                    size: item.productVariant
                        .size,
                    colorName:
                        selectedMasterProduct
                            ? ''
                            : '',
                    warehouseName:
                        item.warehouse
                            .name,
                    zoneName:
                        item.zone.name,
                    subZoneName:
                        item.subZone.name,
                    rackName:
                        item.rack.name,
                    quantity,
                    availableQuantity:
                        item.quantity,
                },
            ],
        );

        setError('');
    };

    /*
     * Remove dispatch item.
     */
    const removeDispatchItem = (
        id: string,
    ) => {
        setDispatchItems(
            (current) =>
                current.filter(
                    (item) =>
                        item.id !== id,
                ),
        );
    };

    /*
     * Total selected quantity.
     */
    const totalDispatchQuantity =
        dispatchItems.reduce(
            (sum, item) =>
                sum + item.quantity,
            0,
        );

    /*
     * Validation.
     */
    const validate = () => {
        if (!lcId) {
            return 'Please select an LC.';
        }

        if (!poId) {
            return 'Please select a PO.';
        }

        if (!buyerId || !selectedBuyer) {
            return 'Please select a valid LC to resolve Buyer.';
        }

        if (!masterProductId) {
            return 'Please select a Master Product.';
        }

        if (!colorId) {
            return 'Please select a Color.';
        }

        if (!gender) {
            return 'Please select a Gender.';
        }

        if (!requestDate) {
            return 'Please select Request Date.';
        }

        if (!stockOutDate) {
            return 'Please select Stock Out Date.';
        }

        if (
            dispatchItems.length ===
            0
        ) {
            return 'Please add at least one inventory item to dispatch.';
        }

        for (const item of dispatchItems) {
            if (
                item.quantity < 1
            ) {
                return `Quantity for size ${item.size} must be at least 1.`;
            }

            if (
                item.quantity >
                item.availableQuantity
            ) {
                return `Issue quantity for size ${item.size} cannot exceed available stock.`;
            }
        }

        return '';
    };

    /*
     * Create Stock Out.
     */
    const handleCreate = async () => {
        setError('');

        const validationError =
            validate();

        if (validationError) {
            setError(
                validationError,
            );
            return;
        }

        if (!gender) {
            return;
        }

        if (!selectedBuyer) {
            setError(
                'Unable to determine the Buyer from the selected LC.',
            );
            return;
        }

        const payload = {
            buyerId: selectedBuyer.id,

            letterOfCreditId:
                Number(lcId),

            purchaseOrderId:
                Number(poId),

            masterProductId:
                Number(masterProductId),

            colorId:
                Number(colorId),

            gender,

            requestDate:
                new Date(
                    `${requestDate}T00:00:00`,
                ).toISOString(),

            stockOutDate:
                stockOutDate
                    ? new Date(
                        `${stockOutDate}T00:00:00`,
                    ).toISOString()
                    : undefined,

            items: dispatchItems.map(
                (item) => ({
                    batchId:
                        item.batchId,

                    productVariantId:
                        item.productVariantId,

                    quantity:
                        Number(item.quantity),
                }),
            ),
        };

        try {
            await createStockOutMutation.mutateAsync(
                payload,
            );

            router.push(
                '/stock-out-list',
            );
        } catch (error: any) {
            const message =
                error?.response
                    ?.data?.message ||
                error?.message ||
                'Failed to create stock out.';

            setError(message);
        }
    };

    const lookupLoading =
        buyersLoading ||
        masterProductsLoading ||
        variantsLoading ||
        stockInLoading;

    return (
        <div className="min-h-full bg-slate-100 p-4">
            <div className="mx-auto max-w-[1600px]">

                {/* =====================================================
                    CREATE LC / PO
                ====================================================== */}

                <section className="border-b border-slate-200 border-l-4 border-[#3c5168] bg-white">

                    {/* HEADER */}

                    <div className="mb-2 flex items-center gap-3 p-4">
                        <h2 className="text-lg font-bold text-slate-900">
                            Create LC / PO
                        </h2>
                    </div>

                    {/* LC CREATION */}

                    <div className="mb-2 grid grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">

                        {/* LC NO */}

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-800">
                                LC No
                            </label>

                            <input
                                type="text"
                                value={newLcNumber}
                                onChange={(event) =>
                                    setNewLcNumber(
                                        event.target.value,
                                    )
                                }
                                placeholder="Enter LC No"
                                className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                            />
                        </div>

                        {/* BUYER */}

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-800">
                                Buyer
                            </label>

                            <div className="relative">
                                <select
                                    value={createLcBuyerId}
                                    onChange={(event) => {
                                        setCreateLcBuyerId(event.target.value);
                                        setCreatePoLcId('');
                                    }}
                                    className="h-10 w-full appearance-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                                >
                                    <option value="">
                                        Select Buyer
                                    </option>

                                    {buyers
                                        .filter(
                                            (buyer) =>
                                                buyer.status ===
                                                'ACTIVE',
                                        )
                                        .map((buyer) => (
                                            <option
                                                key={buyer.id}
                                                value={buyer.id}
                                            >
                                                {buyer.name}
                                            </option>
                                        ))}
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />
                            </div>
                        </div>

                        {/* CREATE LC */}

                        <button
                            type="button"
                            onClick={handleCreateLc}
                            disabled={
                                createLcMutation.isPending
                            }
                            className="h-10 whitespace-nowrap rounded-md bg-[#3c5168] px-6 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createLcMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </span>
                            ) : (
                                'Create LC'
                            )}
                        </button>

                    </div>

                    {/* PO CREATION */}

                    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">

                        {/* PO NO */}

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-800">
                                PO No
                            </label>

                            <input
                                type="text"
                                value={newPoNumber}
                                onChange={(event) =>
                                    setNewPoNumber(
                                        event.target.value,
                                    )
                                }
                                placeholder="Enter PO No"
                                className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                            />
                        </div>

                        {/* LC */}

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-800">
                                LC
                            </label>

                            <div className="relative">
                                <select
                                    value={createPoLcId}
                                    onChange={(event) =>
                                        setCreatePoLcId(event.target.value)
                                    }
                                    disabled={!createLcBuyerId}
                                    className="h-10 w-full appearance-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">
                                        {!createLcBuyerId
                                            ? 'Select Buyer First'
                                            : 'Select LC'}
                                    </option>

                                    {createPoAvailableLcs.map((lc) => (
                                        <option
                                            key={lc.id}
                                            value={lc.id}
                                        >
                                            {lc.lcNumber}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />
                            </div>
                        </div>

                        {/* CREATE PO */}

                        <button
                            type="button"
                            onClick={handleCreatePo}
                            disabled={
                                createPoMutation.isPending ||
                                !createPoLcId
                            }
                            className="h-10 whitespace-nowrap rounded-md bg-[#3c5168] px-6 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createPoMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </span>
                            ) : (
                                'Create PO'
                            )}
                        </button>

                    </div>

                </section>

                {/* =====================================================
                                BASIC INFORMATION
                    ====================================================== */}

                <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <button
                        type="button"
                        onClick={() =>
                            setBasicOpen(
                                (value) => !value,
                            )
                        }
                        className="flex h-16 w-full items-center justify-between border-b border-slate-200 px-4 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="h-10 w-1 rounded-full bg-blue-600" />

                            <span className="text-sm font-semibold text-slate-900">
                                Basic Information
                            </span>
                        </div>

                        {basicOpen ? (
                            <ChevronUp
                                size={18}
                                className="text-slate-500"
                            />
                        ) : (
                            <ChevronDown
                                size={18}
                                className="text-slate-500"
                            />
                        )}
                    </button>

                    {basicOpen && (
                        <div className="p-4">

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                                {/* LC */}

                                <div>
                                    <label className={labelClass}>
                                        LC
                                        <span className="text-red-500">
                                            {' '}
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <select
                                            value={lcId}
                                            onChange={(event) =>
                                                handleLcChange(
                                                    event.target.value,
                                                )
                                            }
                                            className={`${inputClass} appearance-none pr-10`}
                                        >
                                            <option value="">
                                                Select LC
                                            </option>

                                            {allAvailableLcs.map(
                                                (lc) => (
                                                    <option
                                                        key={lc.id}
                                                        value={lc.id}
                                                    >
                                                        {lc.lcNumber}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <ChevronDown
                                            size={16}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* PO */}

                                <div>
                                    <label className={labelClass}>
                                        PO
                                        <span className="text-red-500">
                                            {' '}
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <select
                                            value={poId}
                                            onChange={(event) =>
                                                setPoId(
                                                    event.target.value,
                                                )
                                            }
                                            disabled={!lcId}
                                            className={`${inputClass} appearance-none pr-10`}
                                        >
                                            <option value="">
                                                {!lcId
                                                    ? 'Select LC First'
                                                    : 'Select PO'}
                                            </option>

                                            {availablePos.map(
                                                (po) => (
                                                    <option
                                                        key={po.id}
                                                        value={po.id}
                                                    >
                                                        {po.poNumber}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <ChevronDown
                                            size={16}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* BUYER - AUTO FILLED */}

                                <div>
                                    <label className={labelClass}>
                                        Buyer
                                    </label>

                                    <input
                                        readOnly
                                        value={
                                            selectedBuyer?.name ??
                                            ''
                                        }
                                        placeholder="Auto-filled from LC"
                                        className={`${inputClass} bg-slate-50`}
                                    />
                                </div>

                                {/* REQUEST DATE */}

                                <div>
                                    <label className={labelClass}>
                                        Request Date
                                        <span className="text-red-500">
                                            {' '}
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="date"
                                        value={requestDate}
                                        onChange={(event) =>
                                            setRequestDate(
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                {/* STOCK OUT DATE */}

                                <div>
                                    <label className={labelClass}>
                                        Stock Out Date
                                    </label>

                                    <input
                                        type="date"
                                        value={stockOutDate}
                                        onChange={(event) =>
                                            setStockOutDate(
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                            </div>

                        </div>
                    )}
                </section>

                {/* =====================================================
                    PRODUCT DETAILS
                ====================================================== */}

                <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                    <div className="mb-4">
                        <div className="flex items-center gap-3">
                            <span className="h-10 w-1 rounded-full bg-blue-600" />

                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Product Details
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Select product
                                    information to
                                    load available
                                    warehouse stock.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div>
                            <label
                                className={
                                    labelClass
                                }
                            >
                                Master Product
                                <span className="text-red-500">
                                    {' '}
                                    *
                                </span>
                            </label>

                            <select
                                value={
                                    masterProductId
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleMasterChange(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    lookupLoading
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="">
                                    {masterProductsLoading
                                        ? 'Loading Master Products...'
                                        : 'Select Master Product'}
                                </option>

                                {masterProducts.map(
                                    (
                                        product,
                                    ) => (
                                        <option
                                            key={
                                                product.id
                                            }
                                            value={
                                                product.id
                                            }
                                        >
                                            {
                                                product.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div>
                            <label
                                className={
                                    labelClass
                                }
                            >
                                Color
                                <span className="text-red-500">
                                    {' '}
                                    *
                                </span>
                            </label>

                            <select
                                value={
                                    colorId
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleColorChange(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    !masterProductId ||
                                    availableColors.length ===
                                    0
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="">
                                    {!masterProductId
                                        ? 'Select Master First'
                                        : 'Select Color'}
                                </option>

                                {availableColors.map(
                                    (
                                        color,
                                    ) => (
                                        <option
                                            key={
                                                color.id
                                            }
                                            value={
                                                color.id
                                            }
                                        >
                                            {
                                                color.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div>
                            <label
                                className={
                                    labelClass
                                }
                            >
                                Gender
                                <span className="text-red-500">
                                    {' '}
                                    *
                                </span>
                            </label>

                            <select
                                value={
                                    gender
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleGenderChange(
                                        event
                                            .target
                                            .value as Gender,
                                    )
                                }
                                disabled={
                                    !colorId ||
                                    availableGenders.length ===
                                    0
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="">
                                    {!colorId
                                        ? 'Select Color First'
                                        : 'Select Gender'}
                                </option>

                                {availableGenders.map(
                                    (
                                        value,
                                    ) => (
                                        <option
                                            key={
                                                value
                                            }
                                            value={
                                                value
                                            }
                                        >
                                            {genderLabel(
                                                value,
                                            )}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                    </div>

                    {/* AVAILABLE SIZES */}

                    <div className="mt-4">
                        <label
                            className={
                                labelClass
                            }
                        >
                            Available Sizes
                        </label>

                        <div className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 p-2">
                            {!masterProductId ||
                                !colorId ||
                                !gender ? (
                                <div className="flex h-7 items-center px-1 text-xs text-slate-400">
                                    Select Master
                                    Product, Color
                                    and Gender to
                                    load available
                                    sizes
                                </div>
                            ) : availableSizes.length ===
                                0 ? (
                                <div className="flex h-7 items-center px-1 text-xs text-slate-400">
                                    No available
                                    sizes found
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {availableSizes.map(
                                        (
                                            variant,
                                        ) => (
                                            <span
                                                key={
                                                    variant.id
                                                }
                                                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                                            >
                                                {
                                                    variant.size
                                                }
                                            </span>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </section>

                {/* =====================================================
                    INVENTORY STOCK
                ====================================================== */}

                {masterProductId &&
                    colorId &&
                    gender && (
                        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Available Warehouse Stock
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Stock is grouped by product variant.
                                        Each batch/location record can be issued
                                        independently.
                                    </p>
                                </div>

                                {stockDetailsLoading && (
                                    <Loader2
                                        size={18}
                                        className="animate-spin text-slate-400"
                                    />
                                )}
                            </div>

                            {relevantBatchIds.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                                    No warehouse stock found for the selected
                                    product, color and gender.
                                </div>
                            ) : stockDetailsLoading ? (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                                    Loading warehouse stock...
                                </div>
                            ) : stockRows.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                                    No warehouse stock found for the selected
                                    product variants.
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {availableSizes.map(
                                        (variant, index) => {
                                            const variantRows =
                                                stockRows.filter(
                                                    (row) =>
                                                        row.item
                                                            .productVariantId ===
                                                        variant.id,
                                                );

                                            return (
                                                <div
                                                    key={variant.id}
                                                    className="overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50 p-4"
                                                >
                                                    {/* ITEM HEADER */}

                                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="rounded-md bg-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900">
                                                                ITEM {index + 1}
                                                            </span>

                                                            <span className="text-sm font-semibold text-slate-900">
                                                                Size {variant.size}
                                                            </span>

                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                                                Variant #{variant.id}
                                                            </span>
                                                        </div>

                                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                            {variantRows.reduce(
                                                                (total, row) =>
                                                                    total +
                                                                    row.item.quantity,
                                                                0,
                                                            )}{' '}
                                                            Available
                                                        </span>
                                                    </div>

                                                    {/* SUMMARY */}

                                                    <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-5">
                                                        <SummaryCell
                                                            label="SKU"
                                                            value={variant.sku}
                                                        />

                                                        <SummaryCell
                                                            label="REQ. QTY"
                                                            value="—"
                                                        />

                                                        <SummaryCell
                                                            label="APPROVED"
                                                            value="—"
                                                        />

                                                        <SummaryCell
                                                            label="ALREADY ISSUED"
                                                            value="—"
                                                        />

                                                        <SummaryCell
                                                            label="REMAINING"
                                                            value={variantRows.reduce(
                                                                (total, row) =>
                                                                    total +
                                                                    row.item.quantity,
                                                                0,
                                                            )}
                                                            valueClass="text-rose-600"
                                                        />
                                                    </div>

                                                    {/* AVAILABLE WAREHOUSE STOCK */}

                                                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                                        <div className="bg-slate-800 px-4 py-3 text-xs font-bold tracking-wide text-white">
                                                            AVAILABLE WAREHOUSE STOCK
                                                        </div>

                                                        <div className="overflow-x-auto">
                                                            <table className="w-full min-w-[1050px] border-collapse">
                                                                <thead>
                                                                    <tr className="bg-slate-50">
                                                                        <TableHeader>
                                                                            BATCH
                                                                        </TableHeader>

                                                                        <TableHeader>
                                                                            COLOR
                                                                        </TableHeader>

                                                                        <TableHeader>
                                                                            SIZE
                                                                        </TableHeader>

                                                                        <TableHeader>
                                                                            BUILDING / ZONE
                                                                        </TableHeader>

                                                                        <TableHeader>
                                                                            SUB ZONE / RACK
                                                                        </TableHeader>

                                                                        <TableHeader>
                                                                            AGING
                                                                        </TableHeader>

                                                                        <TableHeader>
                                                                            IN HAND
                                                                        </TableHeader>

                                                                        <TableHeader>
                                                                            QTY TO ISSUE
                                                                        </TableHeader>

                                                                        <TableHeader>
                                                                            ACTION
                                                                        </TableHeader>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {variantRows.length ===
                                                                        0 ? (
                                                                        <tr>
                                                                            <td
                                                                                colSpan={9}
                                                                                className="px-4 py-8 text-center text-sm text-slate-400"
                                                                            >
                                                                                No stock found
                                                                                for this
                                                                                variant.
                                                                            </td>
                                                                        </tr>
                                                                    ) : (
                                                                        variantRows.map(
                                                                            (row) => {
                                                                                const key = `${row.batchId}-${row.item.productVariantId}-${row.item.id}`;

                                                                                const issueQuantity =
                                                                                    issueQuantities[
                                                                                    key
                                                                                    ] ?? 0;

                                                                                const aging =
                                                                                    getAging(
                                                                                        row.stockInDate,
                                                                                    );

                                                                                const selectedVariant =
                                                                                    selectedVariants.find(
                                                                                        (
                                                                                            selectedVariant,
                                                                                        ) =>
                                                                                            selectedVariant.id ===
                                                                                            row
                                                                                                .item
                                                                                                .productVariantId,
                                                                                    );

                                                                                const isAdded =
                                                                                    dispatchItems.some(
                                                                                        (
                                                                                            dispatch,
                                                                                        ) =>
                                                                                            dispatch.id ===
                                                                                            key,
                                                                                    );

                                                                                return (
                                                                                    <tr
                                                                                        key={
                                                                                            row
                                                                                                .item
                                                                                                .id
                                                                                        }
                                                                                        className="hover:bg-slate-50"
                                                                                    >
                                                                                        {/* BATCH */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3 text-xs font-medium text-slate-700">
                                                                                            {
                                                                                                row.batchId
                                                                                            }
                                                                                        </td>

                                                                                        {/* COLOR */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3 text-sm text-slate-700">
                                                                                            {selectedVariant
                                                                                                ?.color
                                                                                                ?.name ??
                                                                                                '—'}
                                                                                        </td>

                                                                                        {/* SIZE */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3">
                                                                                            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                                                                                {
                                                                                                    row
                                                                                                        .item
                                                                                                        .productVariant
                                                                                                        .size
                                                                                                }
                                                                                            </span>
                                                                                        </td>

                                                                                        {/* BUILDING / ZONE */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3 text-sm text-slate-700">
                                                                                            <div className="font-medium">
                                                                                                {
                                                                                                    row
                                                                                                        .item
                                                                                                        .warehouse
                                                                                                        .name
                                                                                                }
                                                                                            </div>

                                                                                            <div className="text-xs text-slate-400">
                                                                                                {
                                                                                                    row
                                                                                                        .item
                                                                                                        .zone
                                                                                                        .name
                                                                                                }
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* SUB ZONE / RACK */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3 text-sm text-slate-700">
                                                                                            <div className="font-medium">
                                                                                                {
                                                                                                    row
                                                                                                        .item
                                                                                                        .subZone
                                                                                                        .name
                                                                                                }
                                                                                            </div>

                                                                                            <div className="text-xs text-slate-400">
                                                                                                {
                                                                                                    row
                                                                                                        .item
                                                                                                        .rack
                                                                                                        .name
                                                                                                }
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* AGING */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3">
                                                                                            <span
                                                                                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${aging.className}`}
                                                                                            >
                                                                                                {
                                                                                                    aging.label
                                                                                                }
                                                                                            </span>
                                                                                        </td>

                                                                                        {/* IN HAND */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3 text-sm font-bold text-slate-900">
                                                                                            {
                                                                                                row
                                                                                                    .item
                                                                                                    .quantity
                                                                                            }
                                                                                        </td>

                                                                                        {/* QTY TO ISSUE */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3">
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        decreaseIssueQuantity(
                                                                                                            key,
                                                                                                        )
                                                                                                    }
                                                                                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                                                                >
                                                                                                    <Minus
                                                                                                        size={
                                                                                                            14
                                                                                                        }
                                                                                                    />
                                                                                                </button>

                                                                                                <input
                                                                                                    type="number"
                                                                                                    min={0}
                                                                                                    max={
                                                                                                        row
                                                                                                            .item
                                                                                                            .quantity
                                                                                                    }
                                                                                                    value={
                                                                                                        issueQuantity
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        event,
                                                                                                    ) =>
                                                                                                        changeIssueQuantity(
                                                                                                            key,
                                                                                                            Number(
                                                                                                                event
                                                                                                                    .target
                                                                                                                    .value,
                                                                                                            ),
                                                                                                            row
                                                                                                                .item
                                                                                                                .quantity,
                                                                                                        )
                                                                                                    }
                                                                                                    className="h-8 w-20 rounded-md border border-slate-200 bg-white px-2 text-center text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                                                                                />

                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        increaseIssueQuantity(
                                                                                                            key,
                                                                                                            row
                                                                                                                .item
                                                                                                                .quantity,
                                                                                                        )
                                                                                                    }
                                                                                                    className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                                                                                                >
                                                                                                    <Plus
                                                                                                        size={
                                                                                                            14
                                                                                                        }
                                                                                                    />
                                                                                                </button>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* ACTION */}

                                                                                        <td className="border-b border-slate-200 px-3 py-3">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    addToDispatch(
                                                                                                        row.batchId,
                                                                                                        row.item,
                                                                                                        row.stockInDate,
                                                                                                    )
                                                                                                }
                                                                                                disabled={
                                                                                                    isAdded
                                                                                                }
                                                                                                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                                                                            >
                                                                                                {isAdded
                                                                                                    ? 'Added'
                                                                                                    : 'Add'}
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            },
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                {/* =====================================================
                    ITEMS TO DISPATCH
                ====================================================== */}

                <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-4 py-4">

                        <div className="flex flex-wrap items-center justify-between gap-3">

                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Items to Dispatch
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Selected inventory
                                    records for this
                                    stock out.
                                </p>
                            </div>

                            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                                {totalDispatchQuantity}{' '}
                                Total Units
                            </span>

                        </div>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px] border-collapse">

                            <thead>
                                <tr className="bg-slate-50">

                                    <TableHeader>
                                        SL
                                    </TableHeader>

                                    <TableHeader>
                                        Product
                                    </TableHeader>

                                    <TableHeader>
                                        Batch
                                    </TableHeader>

                                    <TableHeader>
                                        Color
                                    </TableHeader>

                                    <TableHeader>
                                        Size
                                    </TableHeader>

                                    <TableHeader>
                                        Zone
                                    </TableHeader>

                                    <TableHeader>
                                        Sub Zone
                                    </TableHeader>

                                    <TableHeader>
                                        Rack
                                    </TableHeader>

                                    <TableHeader>
                                        Qty
                                    </TableHeader>

                                    <TableHeader>
                                        Action
                                    </TableHeader>

                                </tr>
                            </thead>

                            <tbody>

                                {dispatchItems.length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                10
                                            }
                                            className="px-4 py-10 text-center text-sm text-slate-400"
                                        >
                                            No inventory
                                            items selected
                                            for dispatch.
                                        </td>
                                    </tr>
                                ) : (
                                    dispatchItems.map(
                                        (
                                            item,
                                            index,
                                        ) => (
                                            <tr
                                                key={
                                                    item.id
                                                }
                                                className="hover:bg-slate-50"
                                            >

                                                <td className="border-b border-slate-200 px-3 py-3 text-sm text-slate-500">
                                                    {index +
                                                        1}
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3 text-sm font-medium text-slate-800">
                                                    {
                                                        selectedMasterProduct?.name
                                                    }
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3 text-xs text-slate-600">
                                                    {
                                                        item.batchId
                                                    }
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3 text-sm text-slate-700">
                                                    {
                                                        item.colorName ||
                                                        '—'
                                                    }
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3">
                                                    <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                                        {
                                                            item.size
                                                        }
                                                    </span>
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3 text-sm text-slate-700">
                                                    {
                                                        item.zoneName
                                                    }
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3 text-sm text-slate-700">
                                                    {
                                                        item.subZoneName
                                                    }
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3 text-sm text-slate-700">
                                                    {
                                                        item.rackName
                                                    }
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3 text-sm font-bold text-slate-900">
                                                    {
                                                        item.quantity
                                                    }
                                                </td>

                                                <td className="border-b border-slate-200 px-3 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeDispatchItem(
                                                                item.id,
                                                            )
                                                        }
                                                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        Remove
                                                    </button>
                                                </td>

                                            </tr>
                                        ),
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

                {/* =====================================================
                    ERROR
                ====================================================== */}

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* =====================================================
                    ACTIONS
                ====================================================== */}

                <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                    <div className="flex flex-wrap justify-end gap-3">

                        <button
                            type="button"
                            onClick={
                                handleReset
                            }
                            disabled={
                                createStockOutMutation.isPending
                            }
                            className="flex h-10 items-center gap-2 rounded-lg border border-orange-300 bg-white px-12 text-sm font-medium text-orange-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RotateCcw
                                size={
                                    16
                                }
                            />

                            Reset
                        </button>

                        <button
                            type="button"
                            className="h-10 rounded-lg border border-green-300 bg-green-700 px-12 text-sm font-medium text-white transition"
                        >
                            Preview
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleCreate
                            }
                            disabled={
                                createStockOutMutation.isPending ||
                                lookupLoading
                            }
                            className="flex h-10 items-center gap-2 rounded-lg bg-[#476AB8] px-12 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createStockOutMutation.isPending ? (
                                <>
                                    <Loader2
                                        size={
                                            16
                                        }
                                        className="animate-spin"
                                    />

                                    Creating...
                                </>
                            ) : (
                                'Create'
                            )}
                        </button>

                    </div>

                </section>

            </div>
        </div>
    );
}

/* =====================================================
   SUMMARY CELL
===================================================== */

function SummaryCell({
    label,
    value,
    valueClass = 'text-slate-900',
}: {
    label: string;
    value: string | number;
    valueClass?: string;
}) {
    return (
        <div className="bg-white px-3 py-3">
            <div className="text-[10px] font-semibold tracking-wide text-slate-400">
                {label}
            </div>

            <div
                className={`mt-1 truncate text-sm font-bold ${valueClass}`}
            >
                {value}
            </div>
        </div>
    );
}

/* =====================================================
   TABLE HEADER
===================================================== */

function TableHeader({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <th className="border-b border-slate-200 px-3 py-3 text-left text-[11px] font-bold tracking-wide text-slate-500">
            {children}
        </th>
    );
}