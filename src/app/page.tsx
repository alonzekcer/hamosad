'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateClientId } from '@/lib/auth';
import { getProfile } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const clientId = getOrCreateClientId();
      const profile = await getProfile(clientId);
      if (profile?.approved) {
        router.replace('/calendar');
      } else {
        router.replace('/login');
      }
    }
    check();
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
