

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState, useEffect } from 'react';

import { useVerifyOtp } from '@/features/auth/hooks';

import { Button } from '@/components/ui/button';

interface OtpFormProps {
    email: string;
    onSuccess: () => void;
    onBack: () => void;
}

export function OtpForm({
    email,
    onSuccess,
    onBack,
}: OtpFormProps) {
    const verifyOtpMutation = useVerifyOtp();
    const queryClient = useQueryClient();

    const [otp, setOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(30);

    useEffect(() => {
        if (resendTimer <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setResendTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        try {
            await verifyOtpMutation.mutateAsync({
                email,
                otp,
            });

            await queryClient.invalidateQueries({
                queryKey: ['auth', 'session'],
            });

            onSuccess();
        } catch {
            // Error is displayed below.
        }
    };

    const handleOtpChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.target.value
            .replace(/\D/g, '')
            .slice(0, 6);

        setOtp(value);
    };

    return (
        <div className="w-full">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
                <img
                    src="/logo.webp"
                    alt="Giant BD"
                    className="h-auto w-42.5"
                />
            </div>

            {/* Heading */}
            <div className="mb-8 text-center">
                <h2 className="text-[21px] font-bold text-[#0b1b42]">
                    Verify Your Identity
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    We've sent a 6-digit code to
                    <br />

                    <span className="font-semibold text-slate-700">
                        {email}
                    </span>
                </p>
            </div>

            <form onSubmit={handleSubmit}>

                {/* OTP */}
                <div className="relative">
                    {/* Visual OTP boxes */}
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className={`flex h-12 w-10.75 items-center justify-center rounded-[10px] bg-[#f1f6ff] transition-all ${otp[index]
                                    ? 'ring-1 ring-[#4B6FBE]'
                                    : ''
                                    }`}
                            >
                                <span className="text-lg font-semibold text-[#172d5d]">
                                    {otp[index] || ''}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Real input */}
                    <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={verifyOtpMutation.isPending}
                        maxLength={6}
                        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
                        aria-label="OTP"
                    />
                </div>

                {/* Error */}
                {verifyOtpMutation.isError && (
                    <p className="mt-4 text-center text-sm text-destructive">
                        Invalid or expired OTP. Please try again.
                    </p>
                )}

                {/* Verify */}
                <Button
                    type="submit"
                    disabled={
                        verifyOtpMutation.isPending ||
                        otp.length !== 6
                    }
                    className="mt-11 h-12 w-full rounded-[12px] bg-[#4B6FBE] text-base font-semibold hover:bg-[#4163ab]"
                >
                    {verifyOtpMutation.isPending
                        ? 'Verifying...'
                        : 'Verify Code'}
                </Button>

                {/* Resend */}

                {resendTimer > 0 ? (
                    <p className="mt-4 text-center text-xs text-slate-400">
                        Resend code in {resendTimer}s
                    </p>
                ) : (
                    <button
                        type="button"
                        className="mt-4 block w-full text-center text-xs font-medium text-[#4B6FBE] hover:underline"
                        onClick={() => {
                            // TODO: Call resend OTP API here
                            setResendTimer(30);
                            setOtp('');
                        }}
                    >
                        Resend code
                    </button>
                )}

                {/* Back */}
                <button
                    type="button"
                    onClick={onBack}
                    disabled={verifyOtpMutation.isPending}
                    className="mt-5 block w-full text-center text-xs font-medium text-[#4B6FBE] hover:underline"
                >
                    Back to login
                </button>
            </form>
        </div>
    );
}