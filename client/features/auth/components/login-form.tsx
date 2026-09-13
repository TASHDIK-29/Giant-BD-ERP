// 'use client';

// import { FormEvent, useState } from 'react';

// import { useLogin } from '@/features/auth/hooks';

// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

// interface LoginFormProps {
//   onSuccess: (email: string) => void;
// }

// export function LoginForm({ onSuccess }: LoginFormProps) {
//   const loginMutation = useLogin();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     try {
//       await loginMutation.mutateAsync({
//         email,
//         password,
//       });

//       onSuccess(email);
//     } catch {
//       // Error is displayed below.
//     }
//   };

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>Sign in</CardTitle>
//         <CardDescription>
//           Enter your email and password to continue.
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>

//             <Input
//               id="email"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(event) => setEmail(event.target.value)}
//               autoComplete="email"
//               required
//               disabled={loginMutation.isPending}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>

//             <Input
//               id="password"
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(event) => setPassword(event.target.value)}
//               autoComplete="current-password"
//               required
//               disabled={loginMutation.isPending}
//             />
//           </div>

//           {loginMutation.isError && (
//             <p className="text-sm text-destructive">
//               Unable to sign in. Please check your email and password.
//             </p>
//           )}

//           <Button
//             type="submit"
//             className="w-full"
//             disabled={loginMutation.isPending}
//           >
//             {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }



'use client';

import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { useLogin } from '@/features/auth/hooks';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginFormProps {
  onSuccess: (email: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({
        email,
        password,
      });

      onSuccess(email);
    } catch {
      // Error is displayed below.
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="mb-10 flex justify-center">
        <img
          src="/logo.webp"
          alt="Giant BD"
          className="h-auto w-42.5"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          disabled={loginMutation.isPending}
          className="h-12.5 rounded-[13px] border-none bg-[#edf3ff] px-4 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-[#4B6FBE]"
        />

        {/* Password */}
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={loginMutation.isPending}
            className="h-12.5 rounded-[13px] border-none bg-[#edf3ff] px-4 pr-12 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-[#4B6FBE]"
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {/* Error */}
        {loginMutation.isError && (
          <p className="text-sm text-destructive">
            Unable to sign in. Please check your email and password.
          </p>
        )}

        {/* Forgot password */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs font-medium text-[#4B6FBE] hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login */}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="h-12.5 w-full rounded-[13px] bg-[#4B6FBE] text-base font-semibold text-white hover:bg-[#4163ab]"
        >
          {loginMutation.isPending
            ? 'Signing in...'
            : 'Login'}
        </Button>
      </form>
    </div>
  );
}