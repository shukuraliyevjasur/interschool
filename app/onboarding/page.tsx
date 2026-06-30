'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n/context';
import { InterSchoolLogo } from '@/components/shared/InterSchoolLogo';
import type { Lang } from '@/lib/i18n/types';

const LANGS: { code: Lang; native: string }[] = [
  { code: 'en', native: 'English'  },
  { code: 'uz', native: "O'zbek"   },
  { code: 'ru', native: 'Русский'  },
];

const PROGRAMS: Record<Lang, string[]> = {
  en: ['English', 'IELTS', 'Russian', 'Graphic Design', 'Computer Literacy'],
  uz: ['Ingliz tili', 'IELTS', 'Rus tili', 'Grafik dizayn', 'Kompyuter savodxonligi'],
  ru: ['Английский язык', 'IELTS', 'Русский язык', 'Графический дизайн', 'Компьютерная грамотность'],
};

const PROGRAMS_LABEL: Record<Lang, string> = {
  en: 'Our programs',
  uz: 'Dasturlarimiz',
  ru: 'Наши программы',
};

const TOTAL_SLIDES = 4;

function TriangleDecor() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 right-0 opacity-[0.08] pointer-events-none"
      aria-hidden="true"
    >
      <polygon points="20,2 38,36 2,36" fill="#F5B800" />
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const [slide, setSlide] = useState(0);

  function finish() {
    localStorage.setItem('interschool_onboarded', '1');
    router.replace('/');
  }

  function next() {
    if (slide < TOTAL_SLIDES - 1) setSlide(slide + 1);
    else finish();
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
      {/* Skip */}
      <div className="flex justify-end px-6 pt-5">
        <button onClick={finish} className="text-white/30 text-sm font-medium hover:text-white/60 transition-colors">
          {t('skip')} →
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">

        {/* ── Slide 0: Language picker ── */}
        {slide === 0 && (
          <div className="w-full max-w-xs animate-fade-in text-center">
            <div className="flex justify-center mb-8">
              <InterSchoolLogo variant="light" size="lg" />
            </div>

            <div className="space-y-3 mb-6">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-semibold text-sm transition-all ${
                    lang === l.code
                      ? 'bg-[#F5B800] text-[#1A1A1A] shadow-lg shadow-[#F5B800]/20'
                      : 'bg-[#242424] text-white/70 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{l.native}</span>
                  {lang === l.code && (
                    <svg className="w-4 h-4 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSlide(1)}
              className="w-full bg-[#F5B800] text-[#1A1A1A] rounded-2xl py-4 font-bold text-sm tracking-wide hover:bg-[#D4970A] transition-all"
            >
              {t('next')}
            </button>
          </div>
        )}

        {/* ── Slide 1: Welcome ── */}
        {slide === 1 && (
          <div className="w-full max-w-xs animate-fade-in relative">
            <TriangleDecor />
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#F5B800]/10 border border-[#F5B800]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#F5B800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h2
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: 'var(--font-barlow), sans-serif' }}
              >
                {t('welcomeTitle')}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">{t('welcomeBody')}</p>
            </div>

            <div className="bg-[#242424] rounded-2xl p-4 border border-white/8">
              <p className="text-[#F5B800] text-[10px] font-semibold uppercase tracking-widest mb-3">
                {PROGRAMS_LABEL[lang]}
              </p>
              <div className="space-y-2">
                {PROGRAMS[lang].map((s) => (
                  <div key={s} className="flex items-center gap-3 border-l-[3px] border-[#F5B800] pl-3">
                    <p className="text-white/80 text-sm font-medium">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Slide 2: Features ── */}
        {slide === 2 && (
          <div className="w-full max-w-xs animate-fade-in">
            <h2
              className="text-2xl font-bold text-white mb-6 text-center"
              style={{ fontFamily: 'var(--font-barlow), sans-serif' }}
            >
              {t('featuresTitle')}
            </h2>
            <div className="space-y-3">
              <div className="bg-[#242424] rounded-2xl p-4 border border-white/8">
                <p className="text-[#F5B800] text-[10px] font-semibold uppercase tracking-widest mb-3">
                  {t('featuresParentLabel')}
                </p>
                <div className="space-y-2.5">
                  {['featureAttendance', 'featurePayments', 'featureHomework', 'featureGrades'].map((key) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <span className="text-[#F5B800] text-base leading-none">•</span>
                      <p className="text-sm text-white/70">{t(key)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#242424] rounded-2xl p-4 border border-white/8">
                <p className="text-[#F5B800] text-[10px] font-semibold uppercase tracking-widest mb-3">
                  {t('featuresStudentLabel')}
                </p>
                <div className="space-y-2.5">
                  {['featureSchedule', 'featureLessons', 'featureLibrary', 'featureResults'].map((key) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <span className="text-[#F5B800] text-base leading-none">•</span>
                      <p className="text-sm text-white/70">{t(key)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Slide 3: How to log in ── */}
        {slide === 3 && (
          <div className="w-full max-w-xs animate-fade-in text-center">
            <div className="w-16 h-16 bg-[#F5B800]/10 border border-[#F5B800]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#F5B800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-barlow), sans-serif' }}
            >
              {t('loginTitle')}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8">{t('loginBody')}</p>
            <div className="bg-[#242424] rounded-2xl p-4 border border-white/8">
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-3">
                {t('loginCodeLabel')}
              </p>
              <div className="flex justify-center gap-2">
                {['A', 'B', 'C', '1', '2', '3'].map((c, i) => (
                  <div key={i} className="w-10 h-12 bg-[#1A1A1A] border border-[#F5B800]/30 rounded-xl flex items-center justify-center text-[#F5B800] font-bold text-lg">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={finish}
              className="w-full mt-6 bg-[#F5B800] text-[#1A1A1A] rounded-2xl py-4 font-bold text-sm tracking-wide hover:bg-[#D4970A] transition-all"
            >
              {t('getStarted')}
            </button>
          </div>
        )}
      </div>

      {/* Progress dots (slides 1-2) */}
      {slide > 0 && slide < 3 && (
        <div className="flex flex-col items-center px-6 pb-10 gap-5">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  slide === i ? 'w-6 h-2 bg-[#F5B800]' : 'w-2 h-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-full max-w-xs bg-[#F5B800] text-[#1A1A1A] rounded-2xl py-4 font-bold text-sm tracking-wide hover:bg-[#D4970A] transition-all"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
}
