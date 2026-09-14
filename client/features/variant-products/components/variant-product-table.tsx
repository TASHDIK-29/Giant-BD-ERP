'use client';

import {
    Check,
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { VariantProductRecord } from '../type';



interface VariantProductTableProps {
    variantProducts: VariantProductRecord[];
    isFetching?: boolean;
    emptyMessage?: string;
}

export function VariantProductTable({
    variantProducts,
    emptyMessage = 'No categories found.',
}: VariantProductTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-225 border-collapse">
                <thead>
                    <tr className="border-b bg-muted/40">
                        {/* Checkbox */}
                        <th className="w-12 px-4 py-3 text-center">
                            <input
                                type="checkbox"
                                aria-label="Select all categories"
                                className="h-4 w-4 rounded border"
                            />
                        </th>

                        {/* ID */}
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            ID
                        </th>

                        {/* Name */}
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            Master Product
                        </th>

                        {/* Warehouse */}
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            SKU
                        </th>

                        {/* Warehouse */}
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            Model No
                        </th>

                        {/* Description */}
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Size
                        </th>

                        {/* Status */}
                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Color
                        </th>

                        {/* Status */}
                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Gender
                        </th>

                        {/* Status */}
                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            UOM
                        </th>

                        {/* Status */}
                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Products/Packet
                        </th>

                        {/* Status */}
                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Status
                        </th>

                        {/* Actions */}
                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {variantProducts.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        variantProducts.map(
                            (product) => (
                                <tr
                                    key={
                                        product.id
                                    }
                                    className="border-b last:border-0 hover:bg-[#476A8B] hover:text-white"
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${product.id}`}
                                            className="h-4 w-4 rounded border"
                                        />
                                    </td>

                                    {/* ID */}
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        {
                                            product.id
                                        }
                                    </td>

                                    {/* Name */}
                                    <td className="px-4 py-3">
                                        <span className="whitespace-nowrap text-sm font-medium">
                                            {
                                                product?.masterProduct?.name
                                            }
                                        </span>
                                    </td>

                                    {/* Code */}
                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {product?.sku}
                                        </span>
                                    </td>

                                    {/* Warehouse */}
                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {product?.modelNumber}
                                        </span>
                                    </td>

                                    {/* Description */}
                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {product?.size}
                                        </span>
                                    </td>


                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {product?.color?.name}
                                        </span>
                                    </td>

                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {product?.gender}
                                        </span>
                                    </td>

                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {product?.uom}
                                        </span>
                                    </td>

                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {product?.productsPerPacket}
                                        </span>
                                    </td>

                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {product?.status}
                                        </span>
                                    </td>

                                    



                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-[#F3F8FE]"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4 text-black" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-[#F3F8FE]"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4 text-black" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive bg-[#F3F8FE]"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-black" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ),
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
}