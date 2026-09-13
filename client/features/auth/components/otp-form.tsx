'use client';

import { useQueryClient } from '@tanstack/react-query';

import { FormEvent, useState } from 'react';

import { useVerifyOtp } from '@/features/auth/hooks';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Verify OTP</CardTitle>

                <CardDescription>
                    Enter the verification code sent to{' '}
                    <span className="font-medium text-foreground">
                        {email}
                    </span>
                    .
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="otp">OTP</Label>

                        <Input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(event) => {
                                const value = event.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 6);

                                setOtp(value);
                            }}
                            required
                            disabled={verifyOtpMutation.isPending}
                        />
                    </div>

                    {verifyOtpMutation.isError && (
                        <p className="text-sm text-destructive">
                            Invalid or expired OTP. Please try again.
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            verifyOtpMutation.isPending || otp.length === 0
                        }
                    >
                        {verifyOtpMutation.isPending
                            ? 'Verifying...'
                            : 'Verify OTP'}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={onBack}
                        disabled={verifyOtpMutation.isPending}
                    >
                        Back to login
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}