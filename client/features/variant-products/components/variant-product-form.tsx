'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useRouter,
} from 'next/navigation';

import {
    Plus,
    X,
} from 'lucide-react';

import {
    useMasterProduct,
} from '@/features/master-products/hooks';

import {
    useColors,
} from '@/features/colors/hooks';

import {
    useCreateVariantProduct,
} from '../hooks';

import type {
    PackagingType,
    VariantGender,
    VariantStatus,
    VariantUom,
} from '../type';

const INITIAL_SIZES = [
    '39',
    '41',
    '43',
    '45',
    '47',
];

export function VariantProductForm() {
    const router = useRouter();

    const createMutation =
        useCreateVariantProduct();

    const [masterProductId, setMasterProductId] =
        useState('');

    const [colorId, setColorId] =
        useState('');

    const [gender, setGender] =
        useState<VariantGender>('MALE');

    const [modelNumber, setModelNumber] =
        useState('');

    const [uom, setUom] =
        useState<VariantUom>('PAIR');

    const [productsPerPacket, setProductsPerPacket] =
        useState('1');

    const [packagingType, setPackagingType] =
        useState<PackagingType>('POLYBAG');

    const [status, setStatus] =
        useState<VariantStatus>('ACTIVE');

    const [sizes, setSizes] =
        useState<string[]>(INITIAL_SIZES);

    const [customSize, setCustomSize] =
        useState('');

    const [error, setError] =
        useState('');

    /*
     * Load master products.
     */
    const {
        data: masterProductData,
        isLoading: masterProductsLoading,
    } = useMasterProduct({
        page: 1,
        limit: 100,
    });

    /*
     * Load colors.
     */
    const {
        data: colorData,
        isLoading: colorsLoading,
    } = useColors({
        page: 1,
        limit: 100,
    });

    const masterProducts =
        masterProductData?.data ?? [];

    const colors =
        colorData?.data ?? [];

    /*
     * Selected master product.
     */
    const selectedMasterProduct =
        useMemo(() => {
            return masterProducts.find(
                (product) =>
                    product.id ===
                    Number(masterProductId),
            );
        }, [
            masterProducts,
            masterProductId,
        ]);

    /*
     * Selected color.
     */
    const selectedColor =
        useMemo(() => {
            return colors.find(
                (color) =>
                    color.id ===
                    Number(colorId),
            );
        }, [
            colors,
            colorId,
        ]);

    /*
     * Auto-generated SKU.
     *
     * Example:
     *
     * TD-SHIRT-CLOTH
     * Silver
     * Male
     *
     * =>
     *
     * TD-SHIRT-CLOTH-SILVER-MALE
     */
    const generatedSku =
        useMemo(() => {
            if (
                !selectedMasterProduct ||
                !selectedColor ||
                !gender
            ) {
                return '';
            }

            return [
                selectedMasterProduct.sku,
                selectedColor.name,
                gender,
            ]
                .filter(Boolean)
                .join('-')
                .replace(
                    /[^a-zA-Z0-9]+/g,
                    '-',
                )
                .replace(
                    /^-+|-+$/g,
                    '',
                )
                .toUpperCase();
        }, [
            selectedMasterProduct,
            selectedColor,
            gender,
        ]);

    /*
     * Add custom size.
     */
    const handleAddSize = () => {
        const value =
            customSize.trim();

        if (!value) {
            return;
        }

        if (
            sizes.includes(value)
        ) {
            setCustomSize('');
            return;
        }

        setSizes((current) => [
            ...current,
            value,
        ]);

        setCustomSize('');
    };

    /*
     * Allow Enter key to add size.
     */
    const handleSizeKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddSize();
        }
    };

    /*
     * Remove size.
     */
    const handleRemoveSize = (
        size: string,
    ) => {
        setSizes((current) =>
            current.filter(
                (item) =>
                    item !== size,
            ),
        );
    };

    /*
     * Reset form.
     */
    const handleReset = () => {
        setMasterProductId('');
        setColorId('');
        setGender('MALE');
        setModelNumber('');
        setUom('PAIR');
        setProductsPerPacket('1');
        setPackagingType('POLYBAG');
        setStatus('ACTIVE');
        setSizes(INITIAL_SIZES);
        setCustomSize('');
        setError('');
    };

    /*
     * Submit.
     */
    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError('');

        if (!masterProductId) {
            setError(
                'Master product is required.',
            );
            return;
        }

        if (!colorId) {
            setError(
                'Color is required.',
            );
            return;
        }

        if (!gender) {
            setError(
                'Gender is required.',
            );
            return;
        }

        if (sizes.length === 0) {
            setError(
                'At least one size is required.',
            );
            return;
        }

        const packetQuantity =
            Number(productsPerPacket);

        if (
            !Number.isInteger(
                packetQuantity,
            ) ||
            packetQuantity <= 0
        ) {
            setError(
                'Products per packet must be a positive number.',
            );
            return;
        }

        try {
            await createMutation.mutateAsync(
                {
                    masterProductId:
                        Number(
                            masterProductId,
                        ),

                    colorId:
                        Number(colorId),

                    gender,

                    sizes,

                    uom,

                    productsPerPacket:
                        packetQuantity,

                    packagingType,

                    ...(modelNumber.trim()
                        ? {
                            modelNumber:
                                modelNumber.trim(),
                        }
                        : {}),

                    status,
                },
            );

            router.push(
                '/variant-fg-product',
            );

            router.refresh();
        } catch (error: any) {
            setError(
                error?.response?.data
                    ?.message ||
                'Failed to create variant product.',
            );
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            {/* Main Information */}
            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="h-10 w-1 rounded-full bg-primary" />

                        <h2 className="text-sm font-semibold">
                            Finished Good Variant Information
                        </h2>
                    </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-3">

                    {/* Master Finished Good */}
                    <div>
                        <label
                            htmlFor="master-product"
                            className="mb-2 block text-sm font-medium"
                        >
                            Master Finished Good{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <select
                            id="master-product"
                            value={
                                masterProductId
                            }
                            onChange={(
                                event,
                            ) =>
                                setMasterProductId(
                                    event.target.value,
                                )
                            }
                            disabled={
                                masterProductsLoading
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                {masterProductsLoading
                                    ? 'Loading master products...'
                                    : 'Select master product'}
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
                                        }{' '}
                                        (
                                        {
                                            product.sku
                                        }
                                        )
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    {/* Color */}
                    <div>
                        <label
                            htmlFor="color"
                            className="mb-2 block text-sm font-medium"
                        >
                            Color{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <select
                            id="color"
                            value={
                                colorId
                            }
                            onChange={(
                                event,
                            ) =>
                                setColorId(
                                    event.target.value,
                                )
                            }
                            disabled={
                                colorsLoading
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                {colorsLoading
                                    ? 'Loading colors...'
                                    : 'Select color'}
                            </option>

                            {colors.map(
                                (color) => (
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
                            htmlFor="gender"
                            className="mb-2 block text-sm font-medium"
                        >
                            Gender{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <select
                            id="gender"
                            value={gender}
                            onChange={(
                                event,
                            ) =>
                                setGender(
                                    event.target
                                        .value as VariantGender,
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="MALE">
                                Male
                            </option>

                            <option value="FEMALE">
                                Female
                            </option>

                            <option value="KIDS">
                                Kids
                            </option>
                        </select>
                    </div>

                    {/* SKU */}
                    <div>
                        <label
                            htmlFor="sku"
                            className="mb-2 block text-sm font-medium"
                        >
                            SKU (Auto)
                        </label>

                        <input
                            id="sku"
                            value={
                                generatedSku
                            }
                            readOnly
                            placeholder="Auto-generated by Master + Color + Gender"
                            className="h-10 w-full cursor-not-allowed rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground outline-none"
                        />
                    </div>

                    {/* Model Number */}
                    <div>
                        <label
                            htmlFor="model-number"
                            className="mb-2 block text-sm font-medium"
                        >
                            Model Number
                        </label>

                        <input
                            id="model-number"
                            type="text"
                            value={
                                modelNumber
                            }
                            onChange={(
                                event,
                            ) =>
                                setModelNumber(
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Optional article number"
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* UOM */}
                    <div>
                        <label
                            htmlFor="uom"
                            className="mb-2 block text-sm font-medium"
                        >
                            UOM{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <select
                            id="uom"
                            value={uom}
                            onChange={(
                                event,
                            ) =>
                                setUom(
                                    event.target
                                        .value as VariantUom,
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="PAIR">
                                Pair
                            </option>

                            <option value="LEFT">
                                Left
                            </option>

                            <option value="RIGHT">
                                Right
                            </option>
                        </select>
                    </div>

                    {/* Products Per Packet */}
                    <div>
                        <label
                            htmlFor="products-per-packet"
                            className="mb-2 block text-sm font-medium"
                        >
                            Products Per Packet{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <input
                            id="products-per-packet"
                            type="number"
                            min="1"
                            value={
                                productsPerPacket
                            }
                            onChange={(
                                event,
                            ) =>
                                setProductsPerPacket(
                                    event.target
                                        .value,
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Packaging Type */}
                    <div>
                        <label
                            htmlFor="packaging-type"
                            className="mb-2 block text-sm font-medium"
                        >
                            Packaging Type
                        </label>

                        <select
                            id="packaging-type"
                            value={
                                packagingType
                            }
                            onChange={(
                                event,
                            ) =>
                                setPackagingType(
                                    event.target
                                        .value as PackagingType,
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="BOX">
                                Box
                            </option>

                            <option value="CARTON">
                                Carton
                            </option>

                            <option value="PACKET">
                                Packet
                            </option>

                            <option value="POLYBAG">
                                Poly Bag
                            </option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="mb-2 block text-sm font-medium"
                        >
                            Status
                        </label>

                        <select
                            id="status"
                            value={status}
                            onChange={(
                                event,
                            ) =>
                                setStatus(
                                    event.target
                                        .value as VariantStatus,
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>
                        </select>
                    </div>

                    {/* Sizes */}
                    <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-medium">
                            Sizes
                        </label>

                        <div className="rounded-md border p-3">
                            {/* Selected sizes */}
                            <div className="flex min-h-8 flex-wrap gap-2">
                                {sizes.map(
                                    (size) => (
                                        <span
                                            key={
                                                size
                                            }
                                            className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                                        >
                                            {size}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveSize(
                                                        size,
                                                    )
                                                }
                                                className="rounded-full hover:bg-background"
                                                aria-label={`Remove size ${size}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ),
                                )}

                                {sizes.length ===
                                    0 && (
                                        <span className="text-xs text-muted-foreground">
                                            No sizes selected.
                                        </span>
                                    )}
                            </div>

                            {/* Add custom size */}
                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    value={
                                        customSize
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setCustomSize(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    onKeyDown={
                                        handleSizeKeyDown
                                    }
                                    placeholder="Add custom"
                                    className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleAddSize
                                    }
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background transition hover:bg-muted"
                                    aria-label="Add size"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse gap-3 rounded-2xl border bg-background p-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    className="h-10 rounded-md bg-red-600 px-16 text-sm font-semibold text-white"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={
                        handleReset
                    }
                    className="h-10 rounded-md border border-orange-400 px-16 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                >
                    Reset
                </button>

                <button
                    type="button"
                    className="h-10 rounded-md bg-emerald-600 px-16 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    Preview
                </button>

                <button
                    type="submit"
                    disabled={
                        createMutation.isPending
                    }
                    className="h-10 rounded-md bg-[#476AB8] px-16 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {createMutation.isPending
                        ? 'Creating...'
                        : 'Create'}
                </button>
            </div>
        </form>
    );
}