
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!data.access_token) {
        throw new Error('Login succeeded, but no access token was returned.');
      }

      localStorage.setItem('studyflow_token', data.access_token);

      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff9fc] p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-8 shadow-lg shadow-pink-100/50"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-3xl">
            🎀
          </div>

          <p className="mt-4 text-sm font-medium text-pink-500">
            Study • Grow • Sparkle ✨
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            Welcome back!
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to continue your study journey.
          </p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="mt-2 w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-pink-500 py-3 font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In 🌸'}
        </button>

        <p className="mt-5 text-center text-xs text-slate-400">
          Your little steps today create big progress tomorrow. 💗
        </p>
      </form>
    </main>
  );
}
