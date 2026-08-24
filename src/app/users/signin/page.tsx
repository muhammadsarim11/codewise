'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api, { storeAccessToken } from '../../utils/api';
import { AuthLayout, FormError, FormSuccess } from '../../component/AuthLayout';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Field';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Account created. Sign in to continue.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/signin', { email, password });
      const { user, accessToken } = response.data;

      if (user) {
        // Both halves matter. The cookie is blocked as a third-party cookie in
        // several browsers, so the bearer token is what actually carries the
        // session there; the user object is a display cache for the sidebar.
        storeAccessToken(accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'That email and password do not match.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Continue to your projects and analyses."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/users/signup" className="text-accent hover:underline underline-offset-2">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <FormError>{error}</FormError>
        <FormSuccess>{success}</FormSuccess>

        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <label htmlFor="signin-password" className="text-[13px] font-medium text-ink-2">
              Password
            </label>
            <Link
              href="/users/forgotpassword"
              className="text-[12px] text-ink-3 hover:text-ink transition-colors duration-150"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="signin-password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-ink-3 text-sm">
          Loading…
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
