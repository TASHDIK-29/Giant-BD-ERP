'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useRouter,
} from 'next/navigation';
import { useCreateUser } from '../hooks';
import { useRoles } from '@/features/roles/hooks';
import { Status } from '@/features/stock-out-list/type';
import { CircleUser } from 'lucide-react';
import Image from 'next/image';




export function CreateUserForm() {

    const router = useRouter();

    const createMutation = useCreateUser();

    const [error, setError] =
        useState('');

    const [name, setName] =
        useState('');

    const [ph, setPh] =
        useState('User');

    const [email, setEmail] =
        useState('');

    const [phone, setPhone] =
        useState('');

    const [roleId, setRoleId] =
        useState('');

    const [roleName, setRoleName] =
        useState('Role');

    const [status, setStatus] = useState<Status>('ACTIVE');
    const [gender, setGender] = useState('');

    const [pass, setPass] = useState('');
    const [confirm, setConfirm] = useState('');


    const {
        data: rolesData,
        isLoading: rolesLoading,
    } = useRoles({
        page: 1,
        limit: 100,
    });

    const roles =
        rolesData?.data ?? [];


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

        if (!email) {
            setError(
                'Email is required.',
            );
            return;
        }

        if (!gender) {
            setError(
                'Gender is required.',
            );
            return;
        }

        if (!roleId) {
            setError(
                'Role is required.',
            );
            return;
        }

        if (!pass) {
            setError(
                'Password is required.',
            );
            return;
        }

        if (pass !== confirm) {
            setError(
                'Wrong Confirm Password',
            );
            return;
        }


        try {
            await createMutation.mutateAsync(
                {
                    name: name,
                    email: email,
                    phone: phone,
                    roleId: Number(roleId),
                    password: pass,
                    gender: gender
                },
            );

            router.push(
                '/user',
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
        setEmail('');
        setPass('');
        setConfirm('');
        setStatus('ACTIVE');
        setGender('');
        setPhone('');
        setError('');
    };

    return (
        <div className='flex gap-4'>
            <div className='w-1/4 border'>
                <div className='flex flex-col items-center justify-center gap-4 pt-4'>
                    <Image src={'/ph.jpg'} alt='ph' width={150} height={150} className='rounded-full' />

                    <h1 className='text-black font-semibold'>
                        {name ? name : ph}
                    </h1>

                    <h1 className='text-black font-medium'>
                        {roleName}
                    </h1>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 w-3/4"
            >
                {/* Buyer Information */}
                <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div className="flex items-center gap-3">
                            <span className="h-10 w-1 rounded-full bg-[#476AB8]" />

                            <h2 className="text-sm font-semibold">
                                Personal Information
                            </h2>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                        {/* Gender */}
                        <div className="flex items-center gap-6 col-span-2">
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="MALE"
                                    checked={gender === 'MALE'}
                                    onChange={(event) =>
                                        setGender(event.target.value)
                                    }
                                    className="h-4 w-4 accent-primary focus:ring-1 focus:ring-primary"
                                />
                                Male
                            </label>

                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="FEMALE"
                                    checked={gender === 'FEMALE'}
                                    onChange={(event) =>
                                        setGender(event.target.value)
                                    }
                                    className="h-4 w-4 accent-primary focus:ring-1 focus:ring-primary"
                                />
                                Female
                            </label>
                        </div>

                        {/* User Name */}
                        <div>
                            <label
                                htmlFor="user-name"
                                className="mb-2 block text-sm font-medium"
                            >
                                Full Name{' '}
                                <span className="text-destructive">
                                    *
                                </span>
                            </label>

                            <input
                                id="user-name"
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

                        {/* Number */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="mb-2 block text-sm font-medium"
                            >
                                Phone{' '}
                            </label>

                            <input
                                id="phone"
                                type="text"
                                value={phone}
                                onChange={(
                                    event,
                                ) =>
                                    setPhone(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Enter product name"
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium"
                            >
                                Email{' '}
                                <span className="text-destructive">
                                    *
                                </span>
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(
                                    event,
                                ) =>
                                    setEmail(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Enter product name"
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>


                        {/* Role */}
                        <div>
                            <label
                                htmlFor="role"
                                className="mb-2 block text-sm font-medium"
                            >
                                Role{' '}
                                <span className="text-destructive">
                                    *
                                </span>
                            </label>

                            {/* <select
                                id="role"
                                value={
                                    roleId
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setRoleId(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    rolesLoading
                                }
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">
                                    {rolesLoading
                                        ? 'Loading roles...'
                                        : 'Select Role'}
                                </option>

                                {roles.map(
                                    (
                                        role,
                                    ) => (
                                        <option
                                            key={
                                                role.id
                                            }
                                            value={
                                                role.id
                                            }
                                        >
                                            {
                                                role.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select> */}

                            <select
                                id="role"
                                value={roleId}
                                onChange={(event) => {
                                    const selectedId = event.target.value;
                                    const selectedRole = roles.find((role) => role.id === Number(selectedId));

                                    setRoleId(selectedId);
                                    setRoleName(selectedRole ? selectedRole.name : '');
                                }}
                                disabled={rolesLoading}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">
                                    {rolesLoading ? 'Loading roles...' : 'Select Role'}
                                </option>

                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label
                                htmlFor="status"
                                className="mb-2 block text-sm font-medium"
                            >
                                Status{' '}
                                <span className="text-destructive">
                                    *
                                </span>
                            </label>

                            <select
                                id="status"
                                value={status}
                                onChange={(
                                    event,
                                ) =>
                                    setStatus(
                                        event.target
                                            .value as Status,
                                    )
                                }
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                            >
                                <option value="LOCAL">
                                    Active
                                </option>

                                <option value="INTERNATIONAL">
                                    Inactive
                                </option>
                            </select>
                        </div>




                    </div>

                </div>

                <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div className="flex items-center gap-3">
                            <span className="h-10 w-1 rounded-full bg-[#476AB8]" />

                            <h2 className="text-sm font-semibold">
                                Password
                            </h2>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                        {/* Pass */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium"
                            >
                                Password{' '}
                                <span className="text-destructive">
                                    *
                                </span>
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={pass}
                                onChange={(
                                    event,
                                ) =>
                                    setPass(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Enter product name"
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Confirm */}
                        <div>
                            <label
                                htmlFor="con-password"
                                className="mb-2 block text-sm font-medium"
                            >
                                Confirm Password{' '}
                                <span className="text-destructive">
                                    *
                                </span>
                            </label>

                            <input
                                id="con-password"
                                type="password"
                                value={confirm}
                                onChange={(
                                    event,
                                ) =>
                                    setConfirm(
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
        </div>
    );
}