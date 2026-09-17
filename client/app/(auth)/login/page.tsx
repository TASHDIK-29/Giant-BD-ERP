// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// import { LoginForm } from '@/features/auth/components/login-form';
// import { OtpForm } from '@/features/auth/components/otp-form';

// type AuthStep = 'login' | 'otp';

// export default function LoginPage() {
//   const router = useRouter();

//   const [step, setStep] = useState<AuthStep>('login');
//   const [email, setEmail] = useState('');

//   const handleLoginSuccess = (loginEmail: string) => {
//     setEmail(loginEmail);
//     setStep('otp');
//   };

//   const handleOtpSuccess = () => {
//     router.replace('/dashboard');
//     router.refresh();
//   };

//   return (
//     <main className="flex min-h-screen items-center justify-center p-6">
//       {step === 'login' ? (
//         <LoginForm onSuccess={handleLoginSuccess} />
//       ) : (
//         <OtpForm
//           email={email}
//           onSuccess={handleOtpSuccess}
//           onBack={() => setStep('login')}
//         />
//       )}
//     </main>
//   );
// }


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { getSession } from '@/features/auth/api';
import { getDefaultRoute } from '@/lib/default-route';

type AuthStep = 'login' | 'otp';

export default function LoginPage() {
    const router = useRouter();

    const [step, setStep] = useState<AuthStep>('login');
    const [email, setEmail] = useState('');

    const handleLoginSuccess = (loginEmail: string) => {
        setEmail(loginEmail);
        setStep('otp');
    };

    const handleOtpSuccess = async () => {
        // router.replace('/dashboard');
        // router.refresh();

        const session =
            await getSession();

        const defaultRoute =
            getDefaultRoute(
                session.permissions,
            );

        if (!defaultRoute) {
            alert(
                'You do not have permission to access the system.',
            );

            return;
        }

        router.replace(
            defaultRoute,
        );

        router.refresh();
    };

    return (
        <AuthShell
            step={step}
            email={email}
            onLoginSuccess={handleLoginSuccess}
            onOtpSuccess={handleOtpSuccess}
            onBack={() => setStep('login')}
        />
    );
}