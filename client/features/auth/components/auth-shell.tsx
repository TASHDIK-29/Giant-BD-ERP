'use client';

import { motion, AnimatePresence } from 'framer-motion';

import { LoginForm } from '@/features/auth/components/login-form';
import { OtpForm } from '@/features/auth/components/otp-form';

type AuthStep = 'login' | 'otp';

interface AuthShellProps {
  step: AuthStep;
  email: string;
  onLoginSuccess: (email: string) => void;
  onOtpSuccess: () => void;
  onBack: () => void;
}

export function AuthShell({
  step,
  email,
  onLoginSuccess,
  onOtpSuccess,
  onBack,
}: AuthShellProps) {
  const isOtp = step === 'otp';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] p-4 sm:p-6">
      <div className="relative h-137.5 w-full max-w-245 overflow-hidden rounded-[38px] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.15)]">

        {/* ------------------------------------------------
            BLUE WELCOME PANEL
        ------------------------------------------------ */}
        <motion.div
          className="absolute top-0 z-20 hidden h-full w-1/2 bg-[#4B6FBE] md:block"
          initial={false}
          animate={{
              borderRadius: isOtp
              ? '150px 0 0 150px'
              : '0 150px 150px 0',
              left: isOtp ? '50%' : '0%',
          }}
          transition={{
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <div className="flex h-full items-center justify-center px-10 text-center">
            <motion.h1
              key={step}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
                delay: 0.25,
              }}
              className="max-w-[320px] text-[38px] font-extrabold leading-[1.05] tracking-tight text-white"
            >
              Welcome to
              <br />
              Giant BD ERP
            </motion.h1>
          </div>
        </motion.div>

        {/* ------------------------------------------------
            AUTH CONTENT
        ------------------------------------------------ */}
        <div className="relative z-10 flex h-full w-full">

          {/* LOGIN SIDE */}
          <motion.div
            className="absolute right-0 flex h-full w-full items-center justify-center px-6 md:w-1/2 md:px-10"
            initial={false}
            animate={{
              x: isOtp ? '100%' : '0%',
              opacity: isOtp ? 0 : 1,
            }}
            transition={{
              duration: 0.6,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <div className="w-full max-w-[320px]">
              <LoginForm onSuccess={onLoginSuccess} />
            </div>
          </motion.div>

          {/* OTP SIDE */}
          <motion.div
            className="absolute left-0 flex h-full w-full items-center justify-center px-6 md:w-1/2 md:px-10"
            initial={false}
            animate={{
              x: isOtp ? '0%' : '-100%',
              opacity: isOtp ? 1 : 0,
            }}
            transition={{
              duration: 0.6,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <div className="w-full max-w-[320px]">
              <OtpForm
                email={email}
                onSuccess={onOtpSuccess}
                onBack={onBack}
              />
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------
            MOBILE WELCOME HEADER
        ------------------------------------------------ */}
        <div className="block md:hidden">
          <div className="absolute left-0 top-0 h-42.5 w-full rounded-b-[70px] bg-[#4B6FBE]">
            <div className="flex h-full items-center justify-center text-center">
              <h1 className="text-3xl font-extrabold leading-tight text-white">
                Welcome to
                <br />
                Giant BD ERP
              </h1>
            </div>
          </div>

          <div className="absolute left-0 top-47.5 w-full px-8">
            <AnimatePresence mode="wait">
              {step === 'login' ? (
                <motion.div
                  key="mobile-login"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <LoginForm onSuccess={onLoginSuccess} />
                </motion.div>
              ) : (
                <motion.div
                  key="mobile-otp"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <OtpForm
                    email={email}
                    onSuccess={onOtpSuccess}
                    onBack={onBack}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}