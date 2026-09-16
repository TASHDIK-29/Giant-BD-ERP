'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useRouter,
} from 'next/navigation';
import { useCreateColor } from '../hooks';




export function CreateColorForm() {

    const router = useRouter();

    const createMutation = useCreateColor();

    const [error, setError] =
        useState('');

    const [name, setName] =
        useState('');

    const [des, setDes] = useState('');


    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError('');

        if (!name) {
            setError(
                'Buyer is required.',
            );
            return;
        }


        try {
            await createMutation.mutateAsync(
                {
                    name: name,
                    description: des
                },
            );

            router.push(
                '/color',
            );

            router.refresh();
        } catch (error: any) {
            setError(
                error?.response?.data
                    ?.message ||
                'Failed to create material',
            );
        }
    };

    const handleReset = () => {
        setName('');
        setDes('');;
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
                            Color Information
                        </h2>
                    </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                    {/* Material Name */}
                    <div>
                        <label
                            htmlFor="Color-name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Color Name{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <input
                            id="Color-name"
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

                    {/* Material Des */}
                    <div>
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