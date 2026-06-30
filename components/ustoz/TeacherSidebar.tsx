'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  {
    href: '/ustoz/sahifa',
    label: 'Bosh sahifa',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    href: '/ustoz/davomat',
    label: 'Davomat',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/teacher', { method: 'DELETE' });
    router.push('/kirish?role=teacher');
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#1A1A1A] flex flex-col z-30 border-r border-white/8">
      <div className="px-5 pt-7 pb-5 border-b border-white/8">
        <p className="text-white font-bold text-sm tracking-[0.15em]" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>INTER SCHOOL</p>
        <p className="text-white/40 text-[10px] tracking-widest uppercase mt-0.5">O&apos;qituvchi</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-[#F5B800]/10 text-[#F5B800]' : 'text-white/40 hover:text-white hover:bg-white/6'
              }`}>
              {item.icon}{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-6">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-white hover:bg-white/10 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Chiqish
        </button>
      </div>
    </aside>
  );
}
