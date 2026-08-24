'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { storeAccessToken } from '../../utils/api';
import { AuthLayout, FormError, FormSuccess } from '../../component/AuthLayout';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Field';

function DetailsStep({ onSent }: { onSent: (email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/signup', { name, email, bio, password });
      onSent(email);
    } catch (err: unknown) {
      const message =
        (axiosMessage(err)) || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormError>{error}</FormError>

      <Input
        label="Name"
        type="text"
        required
        autoComplete="name"
        placeholder="Ada Lovelace"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        label="Email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Bio"
        type="text"
        required
        hint="A line about what you work on."
        placeholder="Backend engineer, mostly Go"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <Input
        label="Password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
        Continue
      </Button>
    </form>
  );
}

function OtpStep({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const response = await api.post('/verify-signup', { email, otp });
      const { user, accessToken } = response.data;

      if (user) {
        storeAccessToken(accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: unknown) {
      setError(axiosMessage(err) || 'Incorrect code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setInfo('');

    try {
      await api.post('/resend-signup-otp', { email });
      setInfo('We sent a new code to your email.');
    } catch (err: unknown) {
      setError(axiosMessage(err) || 'Could not resend the code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4">
      <FormError>{error}</FormError>
      <FormSuccess>{info}</FormSuccess>

      <p className="text-[13px] text-ink-2 -mt-1">
        We sent a 6-digit code to <span className="text-ink font-medium">{email}</span>. It
        expires in 10 minutes.
      </p>

      <Input
        label="Verification code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        maxLength={6}
        placeholder="123456"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={otp.length !== 6}
        className="w-full mt-1"
      >
        Verify and create account
      </Button>

      <div className="flex items-center justify-between text-[13px]">
        <button
          type="button"
          onClick={onBack}
          className="text-ink-2 hover:text-ink transition-colors duration-150"
        >
          Use a different email
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-accent hover:underline underline-offset-2 disabled:opacity-60 disabled:no-underline"
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </form>
  );
}

function axiosMessage(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { error?: string } } }).response;
    return response?.data?.error;
  }
  return undefined;
}

export default function Register() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  return (
    <AuthLayout
      title={pendingEmail ? 'Check your email' : 'Create an account'}
      subtitle={
        pendingEmail
          ? 'Enter the code we sent to verify your address.'
          : 'Analyze your first file in under a minute.'
      }
      footer={
        pendingEmail ? null : (
          <>
            Already have an account?{' '}
            <Link href="/users/signin" className="text-accent hover:underline underline-offset-2">
              Sign in
            </Link>
          </>
        )
      }
    >
      {pendingEmail ? (
        <OtpStep email={pendingEmail} onBack={() => setPendingEmail(null)} />
      ) : (
        <DetailsStep onSent={setPendingEmail} />
      )}
    </AuthLayout>
  );
}
