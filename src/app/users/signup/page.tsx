'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../utils/api';
import { AuthLayout, FormError } from '../../component/AuthLayout';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Field';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/signup', { name, email, bio, password });

      // Sign-up returns 201 without a session, so the user signs in afterwards.
      if (response.status === 201) {
        router.push('/users/signin?registered=true');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Analyze your first file in under a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/users/signin" className="text-accent hover:underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
