'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function OnboardingGate() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem('interschool_onboarded')) {
      router.replace('/onboarding');
    }
  }, [router]);
  return null;
}
