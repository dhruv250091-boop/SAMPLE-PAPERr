'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraduationCap, Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(errorParam ? 'Unable to sign in. Please verify your credentials.' : '');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage('Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl });
  };

  return (
    <div className="flex-1 bg-[#09090D] text-white flex items-center justify-center py-8 sm:py-16 px-3 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Logo and Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#581C87] border border-purple-400 flex items-center justify-center text-white mx-auto shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Sign In to Account
          </h1>
          <p className="text-xs text-[#A3A3B5]">
            Class 12 Commerce academic study and sample papers portal
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="rounded-2xl sm:rounded-3xl bg-[#12121A] border border-purple-500/25 p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
          {/* 1. Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="btn-pop w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-[11px] text-[#707085] text-center mt-2">
              Passwordless Google sign-in for students
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#20202E] w-full" />
            <span className="bg-[#12121A] px-3 text-[11px] text-[#707085] uppercase font-bold tracking-wider">
              or administrator credentials
            </span>
          </div>

          {/* 2. Credentials Sign In Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A3A3B5] mb-1.5 font-heading">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707085]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@commerceprep.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090D] border border-purple-500/20 text-xs sm:text-sm text-white placeholder:text-[#707085] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A3A3B5] mb-1.5 font-heading">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707085]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090D] border border-purple-500/20 text-xs sm:text-sm text-white placeholder:text-[#707085] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-pop w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#581C87] hover:from-[#A855F7] hover:to-[#7C3AED] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50 cursor-pointer border border-purple-400/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick info for testing */}
          <div className="p-3.5 rounded-2xl bg-[#09090D] border border-purple-500/20 text-[11px] text-[#A3A3B5] space-y-1">
            <p className="font-semibold text-white flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Default Administrator Credentials:</span>
            </p>
            <p className="font-mono text-white">admin@commerceprep.edu</p>
            <p className="font-mono text-white">AdminCommerce@2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 bg-[#09090D] flex items-center justify-center p-12 text-xs text-[#707085]">
          Loading sign in portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
