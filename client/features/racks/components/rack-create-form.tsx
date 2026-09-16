'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useRouter,
} from 'next/navigation';
import { useCreateRack } from '../hooks';
import { useSubZone } from '@/features/sub-zones/hooks';




export function CreateRackForm() {

    const router = useRouter();

    const createMutation = useCreateRack();

    const [error, setError] =
        useState('');

    const [name, setName] =
        useState('');

    const [code, setCode] =
        useState('');

    const [subZoneId, setSubZoneId] =
        useState('');

    const [des, setDes] = useState('');


    const {
        data: subZonesData,
        isLoading: subZonesLoading,
    } = useSubZone({
        page: 1,
        limit: 100,
    });

    const subZones =
        subZonesData?.data ?? [];


    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError('');

        if (!name) {
            setError(
                'Name is required.',
            );
            return;
        }

        if (!code) {
            setError(
                'Code is required.',
            );
            return;
        }

        if (!subZoneId) {
            setError(
                'Sub Zone is required.',
            );
            return;
        }


        try {
            await createMutation.mutateAsync(
                {
                    name: name,
                    code: code,
                    subZoneId: subZoneId,
                    description: des
                },
            );

            router.push(
                '/rack',
            );

            router.refresh();
        } catch (error: any) {
            setError(
                error?.response?.data
                    ?.message ||
                'Failed to create rack',
            );
        }
    };

    const handleReset = () => {
        setName('');
        setDes('');
        setCode('');
        setSubZoneId('');
        setError('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            {/* Buyer Information */}
            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="h-10 w-1 rounded-full bg-[#476AB8]" />

                        <h2 className="text-sm font-semibold">
                            Rack Information
                        </h2>
                    </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                    {/* Warehouse Name */}
                    <div>
                        <label
                            htmlFor="rack-name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Rack Name{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <input
                            id="rack-name"
                            type="text"
                            value={name}
                            onChange={(
                                event,
                            ) =>
                                setName(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Enter product name"
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Warehouse Code */}
                    <div>
                        <label
                            htmlFor="rack-Code"
                            className="mb-2 block text-sm font-medium"
                        >
                            Rack Code{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <input
                            id="rack-Code"
                            type="text"
                            value={code}
                            onChange={(
                                event,
                            ) =>
                                setCode(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Enter product name"
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>


                    {/* Warehouse */}
                    <div>
                        <label
                            htmlFor="subZone"
                            className="mb-2 block text-sm font-medium"
                        >
                            Sub Zone{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <select
                            id="subZone"
                            value={
                                subZoneId
                            }
                            onChange={(
                                event,
                            ) =>
                                setSubZoneId(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            disabled={
                                subZonesLoading
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                {subZonesLoading
                                    ? 'Loading categories...'
                                    : 'Select category'}
                            </option>

                            {subZones.map(
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
                    </div>

                    {/* Warehouse Des */}
                    <div className='col-span-2'>
                        <label
                            htmlFor="Color-des"
                            className="mb-2 block text-sm font-medium"
                        >
                            Description{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <input
                            id="Color-des"
                            type="text"
                            value={des}
                            onChange={(
                                event,
                            ) =>
                                setDes(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Enter product name"
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        />
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
                    className="h-10 rounded-md px-12 text-sm font-semibold text-white bg-red-600"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={
                        handleReset
                    }
                    className="h-10 rounded-md border border-orange-400 px-12 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                >
                    Reset
                </button>

                <button
                    type="submit"
                    disabled={
                        createMutation.isPending
                    }
                    className="h-10 rounded-md bg-[#476AB8] px-12 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {createMutation.isPending
                        ? 'Creating...'
                        : 'Create'}
                </button>
            </div>
        </form>
    );
}