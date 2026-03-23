'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) {
      window.location.href = `/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
    } else {
      router.push('/portal?error=invalid');
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-circuit-400 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-carbon-400">Verifying your login...</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-circuit-400 border-t-transparent rounded-full" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
