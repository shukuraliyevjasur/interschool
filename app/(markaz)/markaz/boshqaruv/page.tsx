export const dynamic = 'force-dynamic';
import { createServerClient } from '@/lib/supabase/server';

async function getStats() {
  const db = createServerClient();
  const today = new Date().toISOString().split('T')[0];

  const [students, groups, attendance, overduePayments, pendingPayments] = await Promise.all([
    db.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('groups').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('attendance').select('status').eq('date', today),
    db.from('payments').select('amount_uzs').eq('status', 'overdue'),
    db.from('payments').select('amount_uzs').eq('status', 'pending'),
  ]);

  const totalStudents = students.count ?? 0;
  const totalGroups = groups.count ?? 0;

  const attendanceRows = attendance.data ?? [];
  const presentToday = attendanceRows.filter((r) => r.status === 'present').length;
  const totalMarked = attendanceRows.length;
  const attendancePct = totalMarked > 0 ? Math.round((presentToday / totalMarked) * 100) : null;

  const overdueCount = overduePayments.data?.length ?? 0;
  const overdueTotal = overduePayments.data?.reduce((s, r) => s + r.amount_uzs, 0) ?? 0;
  const pendingCount = pendingPayments.data?.length ?? 0;

  return { totalStudents, totalGroups, presentToday, totalMarked, attendancePct, overdueCount, overdueTotal, pendingCount };
}

function StatCard({
  label, value, sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-[#F5B800]">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-3xl font-bold text-[#1A1A1A]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default async function BoshqaruvPage() {
  const stats = await getStats();
  const today = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
          {today}
        </p>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Boshqaruv paneli</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Faol o'quvchilar"
          value={stats.totalStudents}
          sub="Jami ro'yxatda"
        />
        <StatCard
          label="Bugungi davomat"
          value={stats.attendancePct !== null ? `${stats.attendancePct}%` : '—'}
          sub={stats.totalMarked > 0 ? `${stats.presentToday} / ${stats.totalMarked} belgilangan` : 'Hali belgilanmagan'}
        />
        <StatCard
          label="Muddati o'tgan"
          value={stats.overdueCount}
          sub={stats.overdueTotal > 0 ? `${(stats.overdueTotal / 1000000).toFixed(1)} mln so'm` : "To'lov yo'q"}
        />
        <StatCard
          label="Faol guruhlar"
          value={stats.totalGroups}
          sub={`${stats.pendingCount} ta to'lov kutilmoqda`}
        />
      </div>

      {/* Quick links */}
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Tezkor harakatlar
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { href: '/markaz/davomat',    label: 'Davomat belgilash',       desc: 'Bugungi dars davomati'            },
          { href: '/markaz/oquvchilar', label: "O'quvchi qo'shish",       desc: "Yangi o'quvchi ro'yxatga olish"  },
          { href: '/markaz/tolovlar',   label: "To'lov qabul qilish",     desc: "Oylik to'lovni belgilash"         },
          { href: '/markaz/imtihonlar', label: 'Imtihon natijasi',         desc: 'Ball va baho kiritish'            },
          { href: '/markaz/guruhlar',   label: 'Guruh boshqarish',         desc: 'Guruhlar va jadvallar'            },
          { href: '/markaz/kutubxona',  label: 'Material yuklash',         desc: 'Dars materiallari'                },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 hover:border-[#F5B800]/40 hover:shadow-md transition-all group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5B800] mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#D4970A] transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
