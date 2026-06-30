'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InterSchoolLogo } from '@/components/shared/InterSchoolLogo';

type Role = 'admin' | 'parent' | 'student' | 'teacher';

const ROLE_CONFIG: Record<Role, { label: string; hint: string; inputType: 'password' | 'text'; placeholder: string; maxLength: number }> = {
  admin: {
    label: 'Xodim',
    hint: 'PIN kiriting',
    inputType: 'password',
    placeholder: '••••••',
    maxLength: 10,
  },
  teacher: {
    label: "O'qituvchi",
    hint: 'PIN kiriting',
    inputType: 'password',
    placeholder: '••••••',
    maxLength: 10,
  },
  parent: {
    label: 'Ota-ona',
    hint: 'Kirish kodingizni kiriting',
    inputType: 'text',
    placeholder: 'ABC123',
    maxLength: 6,
  },
  student: {
    label: "O'quvchi",
    hint: 'Kirish kodingizni kiriting',
    inputType: 'text',
    placeholder: 'ABC123',
    maxLength: 6,
  },
};

function KirishForm() {
  const router = useRouter();
  const params = useSearchParams();
  const role = (params.get('role') as Role) ?? 'parent';
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.parent;

  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [teachers, setTeachers] = useState<{ id: number; full_name: string }[]>([]);
  const [teacherId, setTeacherId] = useState<string>('');

  useEffect(() => {
    if (role === 'teacher') {
      fetch('/api/teachers/list').then(r => r.json()).then(data => {
        setTeachers(data.teachers ?? []);
        if (data.teachers?.length > 0) setTeacherId(String(data.teachers[0].id));
      }).catch(() => {});
    }
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError('');

    if (role === 'admin') {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: value }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/markaz/boshqaruv');
    } else if (role === 'teacher') {
      if (!teacherId) { setError("O'qituvchini tanlang"); setLoading(false); return; }
      const res = await fetch('/api/auth/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: value, teacherId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/ustoz/sahifa');
    } else {
      const res = await fetch('/api/auth/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: value, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push(role === 'parent' ? '/ota-ona/bosh' : '/talaba/bosh');
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-5">
      <div className="mb-10">
        <InterSchoolLogo variant="light" size="md" />
      </div>

      <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-6">
        {config.label} sifatida kirish
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#242424] rounded-3xl p-6 space-y-4 border border-white/8 shadow-2xl"
      >
        {role === 'teacher' && (
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              O&apos;qituvchini tanlang
            </label>
            <select
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
              className="w-full border border-white/10 bg-[#1A1A1A] rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-[#F5B800] transition-colors"
            >
              {teachers.length === 0 ? (
                <option value="">Yuklanmoqda...</option>
              ) : teachers.map(t => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
            {config.hint}
          </label>
          <input
            type={config.inputType}
            value={value}
            onChange={e => setValue(
              role === 'admin' || role === 'teacher' ? e.target.value : e.target.value.toUpperCase()
            )}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            autoComplete="off"
            autoFocus={role !== 'teacher'}
            className="w-full border border-white/10 bg-[#1A1A1A] rounded-2xl px-4 py-3.5 text-center text-lg font-bold text-white tracking-widest outline-none focus:border-[#F5B800] transition-colors placeholder:text-white/20"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="w-full bg-[#F5B800] text-[#1A1A1A] rounded-2xl py-3.5 font-bold text-sm tracking-wide disabled:opacity-40 transition-opacity hover:bg-[#D4970A]"
        >
          {loading ? 'Tekshirilmoqda...' : 'Kirish'}
        </button>
      </form>

      <div className="flex gap-2 mt-6">
        {(['parent', 'student', 'teacher', 'admin'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => { router.push(`/kirish?role=${r}`); setValue(''); setError(''); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              role === r
                ? 'bg-[#F5B800] text-[#1A1A1A]'
                : 'text-white/40 hover:text-white/70 border border-white/15 hover:border-white/30'
            }`}
          >
            {ROLE_CONFIG[r].label}
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push('/')}
        className="mt-4 text-white/20 text-xs hover:text-white/50 transition-colors"
      >
        ← Orqaga
      </button>
    </div>
  );
}

export default function KirishPage() {
  return (
    <Suspense>
      <KirishForm />
    </Suspense>
  );
}
