'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { router.replace('/distributor?error=missing_token'); return; }
    router.replace(`/api/distributor/verify?token=${token}`);
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-300 text-sm">Verifying your partner link…</p>
      </div>
    </div>
  );
}

export default function DistributorVerifyPage() {
  return <Suspense><VerifyContent /></Suspense>;
}
