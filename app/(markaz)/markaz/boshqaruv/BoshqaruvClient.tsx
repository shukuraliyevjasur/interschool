'use client';

import { useMemo, useState } from 'react';

type Kpi = {
  label: string;
  value: string;
  accent: string;
  trend: string;
  sub: string;
};

type GroupMetric = {
  name: string;
  pct: number;
  color?: string;
  present?: number;
  total?: number;
};

export type DashboardData = {
  dateLabel: string;
  periodLabel: string;
  kpis: Kpi[];
  revenueBars: { month: string; expectedPct: number; actualPct: number; actualColor: string }[];
  collection: { pct: number; paid: string; pending: string; overdue: string };
  attendanceByGroup: GroupMetric[];
  groupCapacity: { name: string; initials: string; fill: string; pct: number; barColor: string }[];
  payments: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    revenueByGroup: { name: string; amount: string; pct: number }[];
    overdueRows: { id: number; name: string; group: string; amount: string; delay: string; initials: string }[];
    revenueByTeacher: { name: string; groups: string; revenue: string; initials: string }[];
  };
  attendance: {
    stats: { label: string; value: string; sub: string; color: string }[];
    weekly: { label: string; pct: number }[];
    byGroup: GroupMetric[];
    heatmapDays: string[];
    heatmapRows: { name: string; cells: { value: number | null; bg: string; tip: string }[] }[];
  };
  analytics: {
    kpis: { label: string; value: string; trend: string; sub: string }[];
    exams: { name: string; score: string; pct: number; passRate: string; color: string }[];
    teacherWorkload: { name: string; initials: string; groups: number; hours: number; students: number }[];
  };
};

type Tab = 'overview' | 'payments' | 'attendance' | 'analytics';
type PaymentFilter = 'all' | 'paid' | 'pending' | 'overdue';
type AttendanceFilter = 'all' | 'present' | 'absent' | 'late';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Umumiy' },
  { id: 'payments', label: "To'lovlar" },
  { id: 'attendance', label: 'Davomat' },
  { id: 'analytics', label: 'Tahlil' },
];

const paymentFilters: { id: PaymentFilter; label: string }[] = [
  { id: 'all', label: 'Barchasi' },
  { id: 'paid', label: "To'langan" },
  { id: 'pending', label: 'Kutilmoqda' },
  { id: 'overdue', label: "Muddati o'tgan" },
];

const attendanceFilters: { id: AttendanceFilter; label: string }[] = [
  { id: 'all', label: 'Barchasi' },
  { id: 'present', label: 'Kelgan' },
  { id: 'absent', label: 'Kelmagan' },
  { id: 'late', label: 'Kechikkan' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-black/[0.04] shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[1.2px] text-gray-400">
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
      {text}
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] border px-4 py-2 text-xs font-medium transition-colors ${
        active
          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
          : 'border-[#E8E8E8] bg-white text-gray-500 hover:border-[#F5B800]'
      }`}
    >
      {children}
    </button>
  );
}

function TrendLine({ values, color = '#F5B800' }: { values: number[]; color?: string }) {
  const points = useMemo(() => {
    const width = 480;
    const height = 170;
    return values
      .map((value, index) => {
        const x = values.length === 1 ? width : (index / (values.length - 1)) * width;
        const y = height - (Math.max(0, Math.min(value, 100)) / 100) * 130 - 20;
        return `${x},${y}`;
      })
      .join(' ');
  }, [values]);

  const area = points ? `M${points.replaceAll(' ', ' L')} L480 170 L0 170 Z` : '';

  return (
    <svg className="h-44 w-full" viewBox="0 0 480 180" preserveAspectRatio="none">
      {[36, 72, 108, 144].map((y) => (
        <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#F0F0F0" strokeWidth="1" />
      ))}
      {area && <path d={area} fill={color} opacity="0.08" />}
      {points && <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      {points.split(' ').filter(Boolean).map((point, index) => {
        const [x, y] = point.split(',');
        return <circle key={point} cx={x} cy={y} r={index === values.length - 1 ? 4 : 3.5} fill="#fff" stroke={color} strokeWidth="2" />;
      })}
    </svg>
  );
}

function Donut({ pct, label, color = '#F5B800' }: { pct: number; label: string; color?: string }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(pct, 100)) / 100) * circumference;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#F0F0F0" strokeWidth="14" />
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 80 80)"
        strokeLinecap="round"
      />
      <text x="80" y="74" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1A1A1A">
        {pct}%
      </text>
      <text x="80" y="94" textAnchor="middle" fontSize="11" fill="#999">
        {label}
      </text>
    </svg>
  );
}

function OverviewTab({ data }: { data: DashboardData }) {
  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: kpi.accent }} />
            <SectionLabel>{kpi.label}</SectionLabel>
            <div className="mt-2 text-3xl font-extrabold text-[#1A1A1A]">{kpi.value}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: kpi.accent }}>
                {kpi.trend}
              </span>
              <span className="text-[11px] text-gray-400">{kpi.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <SectionLabel>Oylik daromad</SectionLabel>
              <div className="mt-1 text-xl font-bold text-[#1A1A1A]">{data.collection.paid}</div>
            </div>
            <div className="flex gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#F5B800]" /> Tushumlar</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#E8E8E8]" /> Kutilgan</span>
            </div>
          </div>
          <div className="flex h-48 items-end gap-2">
            {data.revenueBars.map((bar) => (
              <div key={bar.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-40 w-full items-end gap-1">
                  <div className="flex-1 rounded-t bg-[#E8E8E8]" style={{ height: `${bar.expectedPct}%` }} />
                  <div className="flex-1 rounded-t" style={{ height: `${bar.actualPct}%`, background: bar.actualColor }} />
                </div>
                <span className="text-[10px] font-medium text-gray-400">{bar.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Yechim darajasi</SectionLabel>
          <div className="flex justify-center py-3">
            <Donut pct={data.collection.pct} label="to'langan" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">To'langan</span><span className="font-semibold text-green-600">{data.collection.paid}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Kutilmoqda</span><span className="font-semibold text-[#D4970A]">{data.collection.pending}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Muddati o'tgan</span><span className="font-semibold text-red-600">{data.collection.overdue}</span></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <SectionLabel>Bugungi davomat</SectionLabel>
            <span className="text-2xl font-extrabold text-[#1A1A1A]">{data.kpis[1]?.value}</span>
          </div>
          <MetricList items={data.attendanceByGroup} empty="Bugun davomat belgilanmagan" />
        </Card>

        <Card className="p-6">
          <SectionLabel>Guruh hajmi</SectionLabel>
          <div className="mt-4 space-y-3">
            {data.groupCapacity.length ? data.groupCapacity.map((group) => (
              <div key={group.name} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5B800]/10 text-[11px] font-bold text-[#D4970A]">
                  {group.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between gap-3">
                    <span className="truncate text-sm font-medium text-[#1A1A1A]">{group.name}</span>
                    <span className="text-[11px] text-gray-400">{group.fill}</span>
                  </div>
                  <div className="h-1 rounded bg-[#F0F0F0]">
                    <div className="h-full rounded" style={{ width: `${group.pct}%`, background: group.barColor }} />
                  </div>
                </div>
              </div>
            )) : <EmptyState text="Faol guruhlar yo'q" />}
          </div>
        </Card>
      </div>
    </>
  );
}

function MetricList({ items, empty }: { items: GroupMetric[]; empty: string }) {
  if (!items.length) return <EmptyState text={empty} />;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-gray-500">{item.name}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded bg-[#F0F0F0]">
            <div className="h-full rounded" style={{ width: `${item.pct}%`, background: item.color ?? '#F5B800' }} />
          </div>
          <span className="w-12 text-right text-xs font-semibold" style={{ color: item.color ?? '#D4970A' }}>
            {item.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

function PaymentsTab({ data, filter, setFilter }: { data: DashboardData; filter: PaymentFilter; setFilter: (value: PaymentFilter) => void }) {
  const filteredCount = filter === 'all' ? data.payments.total : data.payments[filter];

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        {paymentFilters.map((item) => (
          <FilterButton key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>
            {item.label}
          </FilterButton>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[3fr_2fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <SectionLabel>Oylik to'lov dinamikasi</SectionLabel>
              <div className="mt-1 text-lg font-bold text-[#1A1A1A]">Oxirgi 7 oy</div>
            </div>
            <div className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
              {filteredCount} yozuv
            </div>
          </div>
          <TrendLine values={data.revenueBars.map((bar) => bar.actualPct)} />
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">
            {data.revenueBars.map((bar) => <span key={bar.month}>{bar.month}</span>)}
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Guruh bo'yicha daromad</SectionLabel>
          <div className="mt-4 space-y-4">
            {data.payments.revenueByGroup.length ? data.payments.revenueByGroup.map((group) => (
              <div key={group.name}>
                <div className="mb-1.5 flex justify-between gap-3">
                  <span className="truncate text-sm font-medium text-[#1A1A1A]">{group.name}</span>
                  <span className="text-sm font-semibold">{group.amount}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[#F0F0F0]">
                  <div className="h-full rounded bg-[#F5B800]" style={{ width: `${group.pct}%` }} />
                </div>
              </div>
            )) : <EmptyState text="Bu oy to'lovlar yo'q" />}
          </div>
        </Card>
      </div>

      <Card className="mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <SectionLabel>Muddati o'tgan to'lovlar</SectionLabel>
          <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{data.payments.overdue} ta</span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 border-b border-[#F0F0F0] py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <span>O'quvchi</span>
              <span>Guruh</span>
              <span>Summa</span>
              <span>Kechikish</span>
              <span>Holat</span>
            </div>
            {data.payments.overdueRows.length ? data.payments.overdueRows.map((row) => (
              <div key={row.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] items-center gap-3 border-b border-[#F8F8F8] py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-red-50 text-[11px] font-semibold text-red-600">{row.initials}</div>
                  <span className="truncate text-sm font-medium">{row.name}</span>
                </div>
                <span className="truncate text-sm text-gray-500">{row.group}</span>
                <span className="text-sm font-semibold">{row.amount}</span>
                <span className="text-xs font-medium text-red-600">{row.delay}</span>
                <span className="w-fit rounded-lg bg-red-100 px-3 py-1 text-[11px] font-medium text-red-700">Muddati o'tgan</span>
              </div>
            )) : <EmptyState text="Muddati o'tgan to'lovlar yo'q" />}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel>O'qituvchi bo'yicha daromad</SectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {data.payments.revenueByTeacher.length ? data.payments.revenueByTeacher.map((teacher) => (
            <div key={teacher.name} className="rounded-xl border border-black/[0.04] bg-[#FAFAFA] p-4 transition-colors hover:border-[#F5B800]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F5B800]/10 text-sm font-bold text-[#D4970A]">{teacher.initials}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#1A1A1A]">{teacher.name}</div>
                  <div className="text-[11px] text-gray-400">{teacher.groups}</div>
                </div>
              </div>
              <div className="text-xl font-extrabold text-[#1A1A1A]">{teacher.revenue}</div>
            </div>
          )) : <EmptyState text="O'qituvchilar biriktirilmagan" />}
        </div>
      </Card>
    </>
  );
}

function AttendanceTab({ data, filter, setFilter }: { data: DashboardData; filter: AttendanceFilter; setFilter: (value: AttendanceFilter) => void }) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {attendanceFilters.map((item) => (
          <FilterButton key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>
            {item.label}
          </FilterButton>
        ))}
        <div className="ml-auto hidden items-center gap-2 rounded-[10px] border border-[#E8E8E8] bg-white px-3 py-2 text-xs text-gray-400 md:flex">
          <span className="h-3.5 w-3.5 rounded-full border border-gray-300" />
          O'quvchi qidirish...
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.attendance.stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <SectionLabel>{stat.label}</SectionLabel>
            <div className="mt-2 text-3xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="mt-1 text-[11px] text-gray-400">{stat.sub}</div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[3fr_2fr]">
        <Card className="p-6">
          <SectionLabel>Haftalik davomat dinamikasi</SectionLabel>
          <div className="mt-4">
            <TrendLine values={data.attendance.weekly.map((item) => item.pct)} color="#16a34a" />
            <div className="mt-2 flex justify-between text-[10px] text-gray-400">
              {data.attendance.weekly.map((item) => <span key={item.label}>{item.label}</span>)}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Guruh bo'yicha davomat</SectionLabel>
          <div className="mt-4">
            <MetricList items={data.attendance.byGroup} empty="Davomat ma'lumotlari yo'q" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionLabel>Oylik davomat xaritasi</SectionLabel>
          <div className="flex flex-wrap gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#dcfce7]" /> 90%+</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#fef9c3]" /> 70-89%</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#fee2e2]" /> &lt;70%</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[720px] items-center gap-1"
            style={{ gridTemplateColumns: `120px repeat(${data.attendance.heatmapDays.length}, minmax(24px, 1fr))` }}
          >
            <div />
            {data.attendance.heatmapDays.map((day, index) => (
              <div key={`${day}-${index}`} className="text-center text-[9px] font-medium text-gray-300">{day}</div>
            ))}
            {data.attendance.heatmapRows.map((row) => (
              <div key={row.name} className="contents">
                <div className="truncate pr-2 text-[11px] font-medium text-gray-500">{row.name}</div>
                {row.cells.map((cell, index) => (
                  <div key={`${row.name}-${index}`} title={cell.tip} className="aspect-square min-h-4 rounded-[3px]" style={{ background: cell.bg }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

function AnalyticsTab({ data }: { data: DashboardData }) {
  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.analytics.kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <SectionLabel>{kpi.label}</SectionLabel>
            <div className="mt-2 text-3xl font-extrabold text-[#1A1A1A]">{kpi.value}</div>
            <div className="mt-1 flex gap-2">
              <span className="text-xs font-semibold text-[#D4970A]">{kpi.trend}</span>
              <span className="text-[11px] text-gray-400">{kpi.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <SectionLabel>Imtihon natijalari</SectionLabel>
          <div className="mt-4 space-y-4">
            {data.analytics.exams.length ? data.analytics.exams.map((exam) => (
              <div key={exam.name}>
                <div className="mb-1.5 flex justify-between gap-3">
                  <span className="truncate text-sm font-medium text-[#1A1A1A]">{exam.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: exam.color }}>{exam.score}</span>
                    <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">{exam.passRate}</span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[#F0F0F0]">
                  <div className="h-full rounded" style={{ width: `${exam.pct}%`, background: exam.color }} />
                </div>
              </div>
            )) : <EmptyState text="Imtihon natijalari hali yo'q" />}
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>O'qituvchi yuklamasi</SectionLabel>
          <div className="mt-4 space-y-3">
            {data.analytics.teacherWorkload.length ? data.analytics.teacherWorkload.map((teacher) => (
              <div key={teacher.name} className="flex items-center gap-3 rounded-[10px] bg-[#FAFAFA] px-3 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F5B800]/10 text-xs font-bold text-[#D4970A]">{teacher.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[#1A1A1A]">{teacher.name}</div>
                  <div className="text-[11px] text-gray-400">{teacher.groups} guruh - {teacher.hours} soat/hft</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#1A1A1A]">{teacher.students}</div>
                  <div className="text-[10px] text-gray-400">o'quvchi</div>
                </div>
              </div>
            )) : <EmptyState text="O'qituvchilar biriktirilmagan" />}
          </div>
        </Card>
      </div>
    </>
  );
}

export function BoshqaruvClient({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('all');

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="px-4 pt-6 md:px-9 md:pt-7">
        <div className="mb-1 flex items-center justify-between gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#F5B800]">{data.dateLabel}</span>
          <div className="hidden cursor-default items-center gap-2 rounded-[10px] border border-[#E8E8E8] bg-white px-3 py-1.5 text-sm text-gray-500 md:flex">
            <span className="h-3.5 w-3.5 rounded-sm border border-gray-300" />
            {data.periodLabel}
          </div>
        </div>
        <h1 className="mb-5 text-[26px] font-bold text-[#1A1A1A]">Boshqaruv paneli</h1>

        <div className="flex overflow-x-auto border-b border-[#E8E8E8]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 px-5 py-2.5 text-sm font-medium transition-colors hover:text-[#1A1A1A] ${
                activeTab === tab.id ? 'text-[#1A1A1A]' : 'text-gray-400'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 rounded-t bg-[#F5B800]" />}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-6 md:px-9 md:pb-12">
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'payments' && <PaymentsTab data={data} filter={paymentFilter} setFilter={setPaymentFilter} />}
        {activeTab === 'attendance' && <AttendanceTab data={data} filter={attendanceFilter} setFilter={setAttendanceFilter} />}
        {activeTab === 'analytics' && <AnalyticsTab data={data} />}
      </main>
    </div>
  );
}
