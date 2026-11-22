'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { AuthLayout, FormError, FormSuccess } from '../../component/AuthLayout';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Field';

export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await api.post('/forgot-password', { email });
      setStatus({
        type: 'success',
        message: 'If that email has an account, a code is on its way. Check your spam folder too.',
      });
      setStep(2);
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || "That didn't work. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await api.post('/reset-password', { email, otp, newpassword: newPassword });
      setStatus({ type: 'success', message: 'Password updated. Taking you to sign in…' });
      setTimeout(() => router.push('/users/signin'), 1500);
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'That code is wrong or has expired.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Reset your password' : 'Enter your code'}
      subtitle={
        step === 1
          ? 'We’ll email you a six-digit code.'
          : `We sent a code to ${email}. It expires in 10 minutes.`
      }
      footer={
        <Link
          href="/users/signin"
          className="inline-flex items-center gap-1.5 text-ink-2 hover:text-ink transition-colors duration-150"
        >
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      }
    >
      {step === 1 ? (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
          {status?.type === 'error' && <FormError>{status.message}</FormError>}
          {status?.type === 'success' && <FormSuccess>{status.message}</FormSuccess>}

          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          {status?.type === 'error' && <FormError>{status.message}</FormError>}
          {status?.type === 'success' && <FormSuccess>{status.message}</FormSuccess>}

          <Input
            label="Verification code"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            className="font-mono tracking-[0.3em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Input
            label="New password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            hint="At least 6 characters."
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
            Set new password
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setStatus(null);
            }}
            className="text-[12px] text-ink-3 hover:text-ink transition-colors duration-150"
          >
            Use a different email
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
