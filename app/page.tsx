'use client';

import Link from 'next/link';
import { OnboardingGate } from '@/components/shared/OnboardingGate';
import { InterSchoolLogo } from '@/components/shared/InterSchoolLogo';
import { useLang } from '@/lib/i18n/context';

export default function Home() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A1A] px-5">
      <OnboardingGate />

      <div className="mb-12">
        <InterSchoolLogo variant="light" size="lg" />
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/kirish?role=parent"
          className="w-full flex items-center justify-between bg-[#242424] border border-white/10 rounded-2xl px-5 py-4 hover:border-[#F5B800]/60 transition-all group"
        >
          <div>
            <p className="font-bold text-white text-sm group-hover:text-[#F5B800] transition-colors">{t('parent')}</p>
            <p className="text-white/40 text-xs mt-0.5">{t('parentDesc')}</p>
          </div>
          <svg className="w-4 h-4 text-white/30 group-hover:text-[#F5B800] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/kirish?role=student"
          className="w-full flex items-center justify-between bg-[#242424] border border-white/10 rounded-2xl px-5 py-4 hover:border-[#F5B800]/60 transition-all group"
        >
          <div>
            <p className="font-bold text-white text-sm group-hover:text-[#F5B800] transition-colors">{t('student')}</p>
            <p className="text-white/40 text-xs mt-0.5">{t('studentDesc')}</p>
          </div>
          <svg className="w-4 h-4 text-white/30 group-hover:text-[#F5B800] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/kirish?role=admin"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/15 hover:border-white/30 transition-all"
        >
          <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-white/30 text-xs font-medium">{t('staff')}</span>
        </Link>
      </div>
    </div>
  );
}
