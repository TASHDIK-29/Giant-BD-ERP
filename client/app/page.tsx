"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { login, verifyOtp } from "../lib/api";

type AuthStep = "credentials" | "otp";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  async function handleCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setError("");

    try {
      await login(email, password);
      setStep("otp");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    }
  }

  async function handleOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length < 4) {
      setError("Enter the verification code sent to your email.");
      return;
    }

    setError("");

    try {
      await verifyOtp(email, otp);
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to verify the code.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="GiantBD ERP introduction">
        <div className="brand-mark">G</div>
        <div className="visual-copy">
          <p className="eyebrow">GIANTBD ERP</p>
          <h1>Move every part of your business forward.</h1>
          <p className="visual-description">
            One calm command center for your warehouse, products, people, and customers.
          </p>
        </div>
        <div className="visual-note"><span className="status-dot" /> Operations workspace <span className="note-divider" /> v1.0</div>
      </section>

      <section className="auth-panel">
        <div className="mobile-brand"><span className="brand-mark">G</span> GIANTBD ERP</div>
        <div className="auth-content">
          <div className="auth-heading">
            <p className="eyebrow">{step === "credentials" ? "WELCOME BACK" : "SECURITY CHECK"}</p>
            <h2>{step === "credentials" ? "Sign in to your workspace" : "Verify your identity"}</h2>
            <p>{step === "credentials" ? "Enter your details to access the operations dashboard." : `We sent a verification code to ${email}.`}</p>
          </div>

          {step === "credentials" ? (
            <form className="auth-form" onSubmit={handleCredentials}>
              <label htmlFor="email">Work email</label>
              <input id="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              <div className="label-row"><label htmlFor="password">Password</label><button type="button" className="text-button">Forgot password?</button></div>
              <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="primary-button" type="submit">Continue <span aria-hidden="true">-&gt;</span></button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleOtp}>
              <label htmlFor="otp">Verification code</label>
              <input id="otp" className="otp-input" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} />
              <button className="primary-button" type="submit">Verify and enter <span aria-hidden="true">-&gt;</span></button>
              <button type="button" className="back-button" onClick={() => { setError(""); setStep("credentials"); }}><span aria-hidden="true">&lt;-</span> Use different credentials</button>
            </form>
          )}

          <p className={`form-message ${error ? "is-error" : ""}`} aria-live="polite">{error}</p>
          <p className="auth-footer">Need access? <a href="mailto:admin@giantbd.com">Contact your administrator</a></p>
        </div>
      </section>
    </main>
  );
}
