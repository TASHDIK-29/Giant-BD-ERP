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
    Plus,
    RotateCcw,
} from 'lucide-react';

import {
    useCreateStockIn,
    useStockInMasterProducts,
    useStockInRacks,
    useStockInSubZones,
    useStockInVariants,
    useStockInWarehouses,
    useStockInZones,
} from '../hooks';

import {
    Gender,
    StockInRow,
} from '../types';
import { useRouter } from 'next/navigation';

const inputClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

const labelClass =
    'mb-1.5 block text-sm font-medium text-slate-800';

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

function today() {
    return new Date()
        .toISOString()
        .split('T')[0];
}

function addOneYear(date: string) {
    if (!date) {
        return '';
    }

    const parsed = new Date(date);

    parsed.setFullYear(
        parsed.getFullYear() + 1,
    );

    return parsed
        .toISOString()
        .split('T')[0];
}

export function StockInForm() {

    const router = useRouter();

    const [basicOpen, setBasicOpen] =
        useState(true);

    const [masterProductId, setMasterProductId] =
        useState('');

    const [colorId, setColorId] =
        useState('');

    const [gender, setGender] =
        useState<Gender | ''>('');

    const [stockInDate, setStockInDate] =
        useState(today());

    const [productionDate, setProductionDate] =
        useState(today());

    const [expiryDate, setExpiryDate] =
        useState(addOneYear(today()));

    const [rows, setRows] =
        useState<StockInRow[]>([]);

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');

    const {
        data: masterProducts = [],
        isLoading: masterProductsLoading,
    } = useStockInMasterProducts();

    const {
        data: variants = [],
        isLoading: variantsLoading,
    } = useStockInVariants();

    const {
        data: warehouses = [],
        isLoading: warehousesLoading,
    } = useStockInWarehouses();

    const {
        data: zones = [],
        isLoading: zonesLoading,
    } = useStockInZones();

    const {
        data: subZones = [],
        isLoading: subZonesLoading,
    } = useStockInSubZones();

    const {
        data: racks = [],
        isLoading: racksLoading,
    } = useStockInRacks();

    const createStockInMutation =
        useCreateStockIn();

    /*
     * Variants belonging to selected master product.
     */
    const masterVariants = useMemo(() => {
        if (!masterProductId) {
            return [];
        }

        return variants.filter(
            (variant) =>
                variant.masterProductId ===
                Number(masterProductId),
        );
    }, [
        variants,
        masterProductId,
    ]);

    /*
     * Available colors for selected master product.
     */
    const availableColors = useMemo(() => {
        const map = new Map<
            number,
            {
                id: number;
                name: string;
            }
        >();

        masterVariants.forEach(
            (variant) => {
                if (!map.has(variant.colorId)) {
                    map.set(
                        variant.colorId,
                        variant.color,
                    );
                }
            },
        );

        return Array.from(map.values());
    }, [masterVariants]);

    /*
     * Available genders for selected master + color.
     */
    const availableGenders = useMemo(() => {
        const genders = new Set<Gender>();

        masterVariants
            .filter(
                (variant) =>
                    !colorId ||
                    variant.colorId ===
                    Number(colorId),
            )
            .forEach((variant) => {
                genders.add(variant.gender);
            });

        return Array.from(genders);
    }, [
        masterVariants,
        colorId,
    ]);

    /*
     * Actual variants for selected:
     *
     * Master Product
     * Color
     * Gender
     */
    const selectedVariants = useMemo(() => {
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
                Number(masterProductId) &&
                variant.colorId ===
                Number(colorId) &&
                variant.gender === gender,
        );
    }, [
        variants,
        masterProductId,
        colorId,
        gender,
    ]);

    /*
     * Remove duplicate sizes.
     */
    const availableSizes = useMemo(() => {
        const unique = new Map<
            string,
            (typeof selectedVariants)[number]
        >();

        selectedVariants.forEach(
            (variant) => {
                unique.set(
                    variant.size,
                    variant,
                );
            },
        );

        return Array.from(unique.values());
    }, [selectedVariants]);

    /*
     * Auto-filled information.
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

    const materialName =
        selectedMasterProduct?.material
            ?.name ?? '';

    const productsPerPacket =
        selectedVariants[0]
            ?.productsPerPacket ?? '';

    const modelNumber =
        selectedVariants[0]?.modelNumber ??
        '';

    /*
     * Load rows when final variant
     * selection changes.
     */

    // useEffect(() => {
    //     if (
    //         !masterProductId ||
    //         !colorId ||
    //         !gender
    //     ) {
    //         setRows([]);
    //         return;
    //     }

    //     setRows(
    //         availableSizes.map(
    //             (variant) => ({
    //                 size: variant.size,
    //                 quantity: 0,
    //                 warehouseId: '',
    //                 zoneId: '',
    //                 subZoneId: '',
    //                 rackId: '',
    //             }),
    //         ),
    //     );
    // }, [
    //     masterProductId,
    //     colorId,
    //     gender,
    //     availableSizes,
    // ]);

    /*
     * Clear dependent fields.
     */
    useEffect(() => {
        setColorId('');
        setGender('');
    }, [masterProductId]);

    /*
     * Zones filtered by warehouse.
     */
    const getZonesForWarehouse = (
        warehouseId: string,
    ) => {
        if (!warehouseId) {
            return [];
        }

        return zones.filter(
            (zone) =>
                zone.warehouseId ===
                Number(warehouseId),
        );
    };

    /*
     * Sub zones filtered by zone.
     */
    const getSubZonesForZone = (
        zoneId: string,
    ) => {
        if (!zoneId) {
            return [];
        }

        return subZones.filter(
            (subZone) =>
                subZone.zoneId ===
                Number(zoneId),
        );
    };

    /*
     * Racks filtered by sub-zone.
     */
    const getRacksForSubZone = (
        subZoneId: string,
    ) => {
        if (!subZoneId) {
            return [];
        }

        return racks.filter(
            (rack) =>
                rack.subZoneId ===
                Number(subZoneId),
        );
    };

    const updateRow = (
        index: number,
        field: keyof StockInRow,
        value: string | number,
    ) => {
        setRows((current) =>
            current.map((row, rowIndex) => {
                if (rowIndex !== index) {
                    return row;
                }

                const updated = {
                    ...row,
                    [field]: value,
                };

                /*
                 * Warehouse changed.
                 * Clear Zone -> Sub Zone -> Rack.
                 */
                if (
                    field ===
                    'warehouseId'
                ) {
                    updated.zoneId = '';
                    updated.subZoneId = '';
                    updated.rackId = '';
                }

                /*
                 * Zone changed.
                 * Clear Sub Zone -> Rack.
                 */
                if (
                    field === 'zoneId'
                ) {
                    updated.subZoneId = '';
                    updated.rackId = '';
                }

                /*
                 * Sub-zone changed.
                 * Clear Rack.
                 */
                if (
                    field ===
                    'subZoneId'
                ) {
                    updated.rackId = '';
                }

                return updated;
            }),
        );
    };

    // const handleMasterChange = (
    //     value: string,
    // ) => {
    //     setMasterProductId(value);
    //     setColorId('');
    //     setGender('');
    //     setRows([]);
    //     setError('');
    //     setSuccess('');
    // };

    // const handleColorChange = (
    //     value: string,
    // ) => {
    //     setColorId(value);
    //     setGender('');
    //     setRows([]);
    //     setError('');
    // };

    // const handleGenderChange = (
    //     value: Gender,
    // ) => {
    //     setGender(value);
    //     setRows([]);
    //     setError('');
    // };


    const handleMasterChange = (
        value: string,
    ) => {
        setMasterProductId(value);

        setColorId('');
        setGender('');
        setRows([]);

        setError('');
        setSuccess('');
    };

    const handleColorChange = (
        value: string,
    ) => {
        setColorId(value);

        setGender('');
        setRows([]);

        setError('');
        setSuccess('');
    };

    const handleGenderChange = (
        value: Gender,
    ) => {
        setGender(value);

        setError('');
        setSuccess('');

        const sizes = variants
            .filter(
                (variant) =>
                    variant.masterProductId ===
                    Number(masterProductId) &&
                    variant.colorId ===
                    Number(colorId) &&
                    variant.gender === value,
            )
            .map((variant) => variant.size);

        const uniqueSizes = [
            ...new Set(sizes),
        ];

        setRows(
            uniqueSizes.map((size) => ({
                size,
                quantity: 0,
                warehouseId: '',
                zoneId: '',
                subZoneId: '',
                rackId: '',
            })),
        );
    };

    const handleReset = () => {
        setMasterProductId('');
        setColorId('');
        setGender('');

        setStockInDate(today());
        setProductionDate(today());
        setExpiryDate(
            addOneYear(today()),
        );

        setRows([]);

        setError('');
        setSuccess('');
    };

    const validate = () => {
        if (!masterProductId) {
            return 'Please select a Master Product.';
        }

        if (!colorId) {
            return 'Please select a Color.';
        }

        if (!gender) {
            return 'Please select a Gender.';
        }

        if (!stockInDate) {
            return 'Please select Stock In Date.';
        }

        if (!productionDate) {
            return 'Please select Production Date.';
        }

        if (
            expiryDate &&
            expiryDate < productionDate
        ) {
            return 'Expiry Date cannot be before Production Date.';
        }

        const activeRows = rows.filter(
            (row) =>
                row.quantity > 0,
        );

        if (activeRows.length === 0) {
            return 'Please enter quantity for at least one size.';
        }

        for (const row of activeRows) {
            if (!row.warehouseId) {
                return `Please select Warehouse for size ${row.size}.`;
            }

            if (!row.zoneId) {
                return `Please select Zone for size ${row.size}.`;
            }

            if (!row.subZoneId) {
                return `Please select Sub Zone for size ${row.size}.`;
            }

            if (!row.rackId) {
                return `Please select Rack for size ${row.size}.`;
            }

            if (row.quantity < 1) {
                return `Quantity for size ${row.size} must be at least 1.`;
            }
        }

        return '';
    };

    const handleCreate = async () => {
        setError('');
        setSuccess('');

        const validationError =
            validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        if (!gender) {
            return;
        }

        const activeRows = rows.filter(
            (row) =>
                row.quantity > 0,
        );

        const payload = {
            masterProductId:
                Number(masterProductId),

            colorId: Number(colorId),

            gender,

            stockInDate,

            productionDate,

            ...(expiryDate
                ? {
                    expiryDate,
                }
                : {}),

            items: activeRows.map(
                (row) => ({
                    size: row.size,
                    quantity: Number(
                        row.quantity,
                    ),
                    warehouseId:
                        Number(
                            row.warehouseId,
                        ),
                    zoneId: Number(
                        row.zoneId,
                    ),
                    subZoneId:
                        Number(
                            row.subZoneId,
                        ),
                    rackId: Number(
                        row.rackId,
                    ),
                }),
            ),
        };

        try {
            await createStockInMutation.mutateAsync(
                payload,
            );

            router.push('/batch-list');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to create stock in.';

            setError(message);
        }
    };

    const lookupLoading =
        masterProductsLoading ||
        variantsLoading ||
        warehousesLoading ||
        zonesLoading ||
        subZonesLoading ||
        racksLoading;

    return (
        <div className="min-h-full bg-slate-100 p-4">
            <div className="mx-auto max-w-[1600px]">
                {/* =========================
                    BASIC INFORMATION
                ========================== */}

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <button
                        type="button"
                        onClick={() =>
                            setBasicOpen(
                                (value) =>
                                    !value,
                            )
                        }
                        className="flex h-16 w-full items-center justify-between border-b border-slate-200 px-4 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="h-10 w-1 rounded-full bg-blue-600" />

                            <span className="text-sm font-semibold text-slate-900">
                                Basic
                                Information
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
                            <div className="rounded-xl border border-slate-200 p-4">
                                {/* Product heading */}
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="rounded-md bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                        FG Product
                                        1
                                    </span>

                                    <button
                                        type="button"
                                        className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700"
                                    >
                                        <Plus
                                            size={
                                                16
                                            }
                                        />
                                        ADD
                                    </button>
                                </div>

                                {/* =========================
                                    FIRST ROW
                                ========================== */}

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {/* Master Product */}
                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Master
                                            Product{' '}
                                            <span className="text-red-500">
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
                                            className={
                                                inputClass
                                            }
                                            disabled={
                                                lookupLoading
                                            }
                                        >
                                            <option value="">
                                                {masterProductsLoading
                                                    ? 'Loading Master Products...'
                                                    : 'Select Master'}
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

                                    {/* Color */}
                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Color{' '}
                                            <span className="text-red-500">
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
                                                    : availableColors.length ===
                                                        0
                                                        ? 'No colors available'
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

                                    {/* Gender */}
                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Gender{' '}
                                            <span className="text-red-500">
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

                                {/* =========================
                                    AUTO FILLED ROW
                                ========================== */}

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Material
                                            Name
                                        </label>

                                        <input
                                            value={
                                                materialName
                                            }
                                            readOnly
                                            placeholder="Auto-filled from master"
                                            className={`${inputClass} bg-slate-50`}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Products
                                            Per Packet
                                        </label>

                                        <input
                                            value={
                                                productsPerPacket
                                            }
                                            readOnly
                                            placeholder="Auto-filled from variant"
                                            className={`${inputClass} bg-slate-50`}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Model
                                            Number
                                        </label>

                                        <input
                                            value={
                                                modelNumber
                                            }
                                            readOnly
                                            placeholder="Auto-filled from variant"
                                            className={`${inputClass} bg-slate-50`}
                                        />
                                    </div>
                                </div>

                                {/* =========================
                                    DATES
                                ========================== */}

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Stock In
                                            Date{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                stockInDate
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setStockInDate(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Production
                                            Date{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                productionDate
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setProductionDate(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Expiry
                                            Date
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                expiryDate
                                            }
                                            min={
                                                productionDate
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setExpiryDate(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        />
                                    </div>
                                </div>

                                {/* =========================
                                    AVAILABLE SIZES
                                ========================== */}

                                <div className="mt-4">
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Available
                                        Sizes
                                    </label>

                                    <div className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 p-2">
                                        {!masterProductId ||
                                            !colorId ||
                                            !gender ? (
                                            <div className="flex h-7 items-center px-1 text-xs text-slate-400">
                                                Select
                                                Master
                                                Product,
                                                Color and
                                                Gender to
                                                load
                                                available
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

                                {/* =========================
                                    NO CUSTOM SIZE
                                ========================== */}

                                {/* Intentionally omitted:
                                    Custom size is disabled
                                    according to current
                                    requirement.
                                */}
                            </div>
                        </div>
                    )}
                </section>

                {/* =========================
                    SIZE / LOCATION TABLE
                ========================== */}

                {rows.length > 0 && (
                    <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600">
                                            Size
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600">
                                            Gender
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600">
                                            Quantity{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600">
                                            Warehouse{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600">
                                            Zone{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600">
                                            Sub Zone{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600">
                                            Rack{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.map(
                                        (
                                            row,
                                            index,
                                        ) => {
                                            const rowZones =
                                                getZonesForWarehouse(
                                                    row.warehouseId,
                                                );

                                            const rowSubZones =
                                                getSubZonesForZone(
                                                    row.zoneId,
                                                );

                                            const rowRacks =
                                                getRacksForSubZone(
                                                    row.subZoneId,
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        row.size
                                                    }
                                                    className="hover:bg-slate-50"
                                                >
                                                    {/* Size */}
                                                    <td className="border-b border-slate-200 px-3 py-3 text-sm font-semibold text-slate-900">
                                                        {
                                                            row.size
                                                        }
                                                    </td>

                                                    {/* Gender */}
                                                    <td className="border-b border-slate-200 px-3 py-3">
                                                        <span className="inline-flex rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                                                            {genderLabel(
                                                                gender as Gender,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Quantity */}
                                                    <td className="border-b border-slate-200 px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min={
                                                                0
                                                            }
                                                            value={
                                                                row.quantity
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateRow(
                                                                    index,
                                                                    'quantity',
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="h-10 w-[70px] rounded-lg border border-slate-200 px-3 text-center text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </td>

                                                    {/* Warehouse */}
                                                    <td className="border-b border-slate-200 px-3 py-3">
                                                        <select
                                                            value={
                                                                row.warehouseId
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateRow(
                                                                    index,
                                                                    'warehouseId',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-10 w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        >
                                                            <option value="">
                                                                Select
                                                            </option>

                                                            {warehouses
                                                                .filter(
                                                                    (
                                                                        warehouse,
                                                                    ) =>
                                                                        warehouse.status ===
                                                                        'ACTIVE',
                                                                )
                                                                .map(
                                                                    (
                                                                        warehouse,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                warehouse.id
                                                                            }
                                                                            value={
                                                                                warehouse.id
                                                                            }
                                                                        >
                                                                            {
                                                                                warehouse.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                        </select>
                                                    </td>

                                                    {/* Zone */}
                                                    <td className="border-b border-slate-200 px-3 py-3">
                                                        <select
                                                            value={
                                                                row.zoneId
                                                            }
                                                            disabled={
                                                                !row.warehouseId
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateRow(
                                                                    index,
                                                                    'zoneId',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-10 w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                                                        >
                                                            <option value="">
                                                                {!row.warehouseId
                                                                    ? 'Select Warehouse'
                                                                    : 'Select'}
                                                            </option>

                                                            {rowZones
                                                                .filter(
                                                                    (
                                                                        zone,
                                                                    ) =>
                                                                        zone.status ===
                                                                        'ACTIVE',
                                                                )
                                                                .map(
                                                                    (
                                                                        zone,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                zone.id
                                                                            }
                                                                            value={
                                                                                zone.id
                                                                            }
                                                                        >
                                                                            {
                                                                                zone.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                        </select>
                                                    </td>

                                                    {/* Sub Zone */}
                                                    <td className="border-b border-slate-200 px-3 py-3">
                                                        <select
                                                            value={
                                                                row.subZoneId
                                                            }
                                                            disabled={
                                                                !row.zoneId
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateRow(
                                                                    index,
                                                                    'subZoneId',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-10 w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                                                        >
                                                            <option value="">
                                                                {!row.zoneId
                                                                    ? 'Select Zone'
                                                                    : 'Select'}
                                                            </option>

                                                            {rowSubZones
                                                                .filter(
                                                                    (
                                                                        subZone,
                                                                    ) =>
                                                                        subZone.status ===
                                                                        'ACTIVE',
                                                                )
                                                                .map(
                                                                    (
                                                                        subZone,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                subZone.id
                                                                            }
                                                                            value={
                                                                                subZone.id
                                                                            }
                                                                        >
                                                                            {
                                                                                subZone.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                        </select>
                                                    </td>

                                                    {/* Rack */}
                                                    <td className="border-b border-slate-200 px-3 py-3">
                                                        <select
                                                            value={
                                                                row.rackId
                                                            }
                                                            disabled={
                                                                !row.subZoneId
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateRow(
                                                                    index,
                                                                    'rackId',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-10 w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                                                        >
                                                            <option value="">
                                                                {!row.subZoneId
                                                                    ? 'Select Sub Zone'
                                                                    : 'Select'}
                                                            </option>

                                                            {rowRacks
                                                                .filter(
                                                                    (
                                                                        rack,
                                                                    ) =>
                                                                        rack.status ===
                                                                        'ACTIVE',
                                                                )
                                                                .map(
                                                                    (
                                                                        rack,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                rack.id
                                                                            }
                                                                            value={
                                                                                rack.id
                                                                            }
                                                                        >
                                                                            {
                                                                                rack.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* =========================
                    ERROR / SUCCESS
                ========================== */}

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                {/* =========================
                    ACTIONS
                ========================== */}

                <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={
                                handleReset
                            }
                            disabled={
                                createStockInMutation.isPending
                            }
                            className="flex h-10 items-center gap-2 rounded-lg border border-orange-300 bg-white px-12 text-sm font-medium text-orange-700 transition  disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RotateCcw
                                size={16}
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
                                createStockInMutation.isPending ||
                                lookupLoading
                            }
                            className="flex h-10 items-center gap-2 rounded-lg bg-[#476AB8] px-12 text-sm font-semibold text-white transition  disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createStockInMutation.isPending ? (
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