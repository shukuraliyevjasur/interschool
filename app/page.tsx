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

      <div className="mb-14">
        <InterSchoolLogo variant="light" size="lg" />
      </div>

      {/* Primary hero buttons */}
      <div className="w-full max-w-xs space-y-3 mb-16">
        <Link
          href="/kirish?role=parent"
          className="w-full flex items-center justify-between bg-[#242424] border border-white/10 rounded-2xl px-6 py-5 hover:border-[#F5B800]/60 hover:bg-[#2a2a2a] transition-all group"
        >
          <div>
            <p className="font-bold text-white text-base group-hover:text-[#F5B800] transition-colors">{t('parent')}</p>
            <p className="text-white/40 text-sm mt-0.5">{t('parentDesc')}</p>
          </div>
          <svg className="w-5 h-5 text-white/20 group-hover:text-[#F5B800] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/kirish?role=student"
          className="w-full flex items-center justify-between bg-[#242424] border border-white/10 rounded-2xl px-6 py-5 hover:border-[#F5B800]/60 hover:bg-[#2a2a2a] transition-all group"
        >
          <div>
            <p className="font-bold text-white text-base group-hover:text-[#F5B800] transition-colors">{t('student')}</p>
            <p className="text-white/40 text-sm mt-0.5">{t('studentDesc')}</p>
          </div>
          <svg className="w-5 h-5 text-white/20 group-hover:text-[#F5B800] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Hidden staff links — small, muted, at the bottom */}
      <div className="flex items-center gap-6">
        <Link
          href="/kirish?role=teacher"
          className="flex items-center gap-1.5 text-white/20 hover:text-white/40 transition-colors py-2 px-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-[11px] font-medium">{t('teacher')}</span>
        </Link>

        <span className="w-px h-3 bg-white/10" />

        <Link
          href="/kirish?role=admin"
          className="flex items-center gap-1.5 text-white/20 hover:text-white/40 transition-colors py-2 px-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[11px] font-medium">{t('staff')}</span>
        </Link>
      </div>
    </div>
  );
}
