export const dynamic = 'force-dynamic';

import { BoshqaruvClient, type DashboardData } from './BoshqaruvClient';
import { createServerClient } from '@/lib/supabase/server';

type StudentRow = {
  id: number;
  full_name: string;
  group_id: number | null;
  status: string | null;
};

type GroupRow = {
  id: number;
  name: string;
  max_students: number | null;
  status: string | null;
};

type PaymentRow = {
  id: number;
  student_id: number | null;
  amount_uzs: number;
  month_label: string | null;
  due_date: string;
  paid_date: string | null;
  status: string;
};

type AttendanceRow = {
  student_id: number | null;
  group_id: number | null;
  date: string;
  status: string;
};

type TeacherRow = {
  id: number;
  full_name: string;
  status: string | null;
};

type AssignmentRow = {
  teacher_id: number;
  group_id: number;
};

type ExamRow = {
  id: number;
  title: string;
  max_score: number;
  group_id: number | null;
};

type ExamResultRow = {
  exam_id: number;
  score: number;
};

const UZ_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const UZ_WEEKDAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function formatMoney(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 1 : 2)}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return `${amount}`;
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function statusColor(value: number) {
  if (value >= 90) return '#16a34a';
  if (value >= 70) return '#F5B800';
  return '#dc2626';
}

function heatmapBg(value: number | null) {
  if (value === null) return '#F5F5F5';
  if (value >= 90) return '#dcfce7';
  if (value >= 70) return '#fef9c3';
  return '#fee2e2';
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function groupPaymentsByMonth(payments: PaymentRow[]) {
  const now = new Date();
  const months = Array.from({ length: 7 }, (_, index) => {
    const date = addMonths(now, index - 6);
    return {
      key: monthKey(date),
      month: UZ_MONTHS[date.getMonth()],
      expected: 0,
      actual: 0,
    };
  });

  for (const payment of payments) {
    const date = payment.due_date ? new Date(payment.due_date) : null;
    if (!date || Number.isNaN(date.getTime())) continue;
    const bucket = months.find((item) => item.key === monthKey(date));
    if (!bucket) continue;
    bucket.expected += payment.amount_uzs;
    if (payment.status === 'paid') bucket.actual += payment.amount_uzs;
  }

  const max = Math.max(...months.map((item) => item.expected), 1);
  return months.map((item, index) => ({
    month: item.month,
    expectedPct: Math.max(8, pct(item.expected, max)),
    actualPct: Math.max(item.actual > 0 ? 8 : 0, pct(item.actual, max)),
    actualColor: index === months.length - 1 ? '#D4970A' : '#F5B800',
  }));
}

function groupAttendanceByWeek(attendance: AttendanceRow[]) {
  const today = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const end = addDays(today, -(5 - index) * 7);
    const start = addDays(end, -6);
    const rows = attendance.filter((row) => row.date >= isoDate(start) && row.date <= isoDate(end));
    const present = rows.filter((row) => row.status === 'present').length;
    return {
      label: index === 5 ? 'Bu hf' : `${index + 1}-hf`,
      pct: pct(present, rows.length),
    };
  });
}

function safeDateLabel(now: Date) {
  return `${UZ_WEEKDAYS[now.getDay()]}, ${now.getDate()}-${UZ_MONTHS[now.getMonth()].toLowerCase()}, ${now.getFullYear()}`.toUpperCase();
}

async function getDashboardData(): Promise<DashboardData> {
  const db = createServerClient();
  const today = isoDate(new Date());
  const monthStart = isoDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const recentStart = isoDate(addDays(new Date(), -34));

  const [
    studentsRes,
    groupsRes,
    paymentsRes,
    attendanceRes,
    teachersRes,
    assignmentsRes,
    examsRes,
    examResultsRes,
  ] = await Promise.all([
    db.from('students').select('id, full_name, group_id, status').order('full_name'),
    db.from('groups').select('id, name, max_students, status').order('name'),
    db.from('payments').select('id, student_id, amount_uzs, month_label, due_date, paid_date, status').order('due_date', { ascending: false }),
    db.from('attendance').select('student_id, group_id, date, status').gte('date', recentStart).order('date'),
    db.from('teachers').select('id, full_name, status').order('full_name'),
    db.from('teacher_groups').select('teacher_id, group_id'),
    db.from('exams').select('id, title, max_score, group_id').order('exam_date', { ascending: false }).limit(8),
    db.from('exam_results').select('exam_id, score'),
  ]);

  const students = (studentsRes.data ?? []) as StudentRow[];
  const activeStudents = students.filter((student) => student.status === 'active');
  const groups = (groupsRes.data ?? []) as GroupRow[];
  const activeGroups = groups.filter((group) => group.status === 'active');
  const payments = (paymentsRes.data ?? []) as PaymentRow[];
  const attendance = (attendanceRes.data ?? []) as AttendanceRow[];
  const teachers = (teachersRes.data ?? []) as TeacherRow[];
  const activeTeachers = teachers.filter((teacher) => teacher.status !== 'archived');
  const assignments = (assignmentsRes.data ?? []) as AssignmentRow[];
  const exams = (examsRes.data ?? []) as ExamRow[];
  const examResults = (examResultsRes.data ?? []) as ExamResultRow[];

  const studentMap = new Map(students.map((student) => [student.id, student]));
  const groupMap = new Map(groups.map((group) => [group.id, group]));

  const todayAttendance = attendance.filter((row) => row.date === today);
  const presentToday = todayAttendance.filter((row) => row.status === 'present').length;
  const absentToday = todayAttendance.filter((row) => row.status === 'absent').length;
  const lateToday = todayAttendance.filter((row) => row.status === 'late').length;
  const attendancePct = pct(presentToday, todayAttendance.length);

  const monthPayments = payments.filter((payment) => payment.due_date >= monthStart);
  const paidTotal = monthPayments.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + payment.amount_uzs, 0);
  const pendingTotal = monthPayments.filter((payment) => payment.status === 'pending').reduce((sum, payment) => sum + payment.amount_uzs, 0);
  const overduePayments = payments.filter((payment) => payment.status === 'overdue');
  const overdueTotal = overduePayments.reduce((sum, payment) => sum + payment.amount_uzs, 0);
  const expectedTotal = monthPayments.reduce((sum, payment) => sum + payment.amount_uzs, 0);
  const collectionPct = pct(paidTotal, expectedTotal);

  const studentCounts = new Map<number, number>();
  for (const student of activeStudents) {
    if (student.group_id) studentCounts.set(student.group_id, (studentCounts.get(student.group_id) ?? 0) + 1);
  }

  const attendanceByGroup = activeGroups.map((group) => {
    const rows = todayAttendance.filter((row) => row.group_id === group.id);
    const value = pct(rows.filter((row) => row.status === 'present').length, rows.length);
    return {
      name: group.name,
      pct: value,
      present: rows.filter((row) => row.status === 'present').length,
      total: rows.length,
      color: statusColor(value),
    };
  }).slice(0, 6);

  const groupCapacity = activeGroups.map((group) => {
    const count = studentCounts.get(group.id) ?? 0;
    const max = group.max_students ?? 0;
    const value = pct(count, max);
    return {
      name: group.name,
      initials: initials(group.name) || 'IS',
      fill: `${count}/${max || '-'}`,
      pct: Math.min(value, 100),
      barColor: value >= 95 ? '#dc2626' : value >= 85 ? '#16a34a' : '#F5B800',
    };
  }).slice(0, 6);

  const revenueByGroupMap = new Map<number, number>();
  for (const payment of monthPayments) {
    const groupId = payment.student_id ? studentMap.get(payment.student_id)?.group_id : null;
    if (!groupId) continue;
    revenueByGroupMap.set(groupId, (revenueByGroupMap.get(groupId) ?? 0) + payment.amount_uzs);
  }
  const maxGroupRevenue = Math.max(...revenueByGroupMap.values(), 1);
  const revenueByGroup = [...revenueByGroupMap.entries()]
    .map(([groupId, amount]) => ({
      name: groupMap.get(groupId)?.name ?? 'Guruhsiz',
      amount: `${formatMoney(amount)} so'm`,
      pct: pct(amount, maxGroupRevenue),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);

  const overdueRows = overduePayments.slice(0, 6).map((payment) => {
    const student = payment.student_id ? studentMap.get(payment.student_id) : null;
    const group = student?.group_id ? groupMap.get(student.group_id) : null;
    const delay = Math.max(0, Math.ceil((Date.now() - new Date(payment.due_date).getTime()) / 86_400_000));
    return {
      id: payment.id,
      name: student?.full_name ?? "Noma'lum o'quvchi",
      group: group?.name ?? 'Guruhsiz',
      amount: `${formatMoney(payment.amount_uzs)} so'm`,
      delay: `${delay} kun`,
      initials: initials(student?.full_name ?? 'IS'),
    };
  });

  const revenueByTeacher = activeTeachers.map((teacher) => {
    const teacherGroupIds = assignments.filter((assignment) => assignment.teacher_id === teacher.id).map((assignment) => assignment.group_id);
    const amount = [...revenueByGroupMap.entries()]
      .filter(([groupId]) => teacherGroupIds.includes(groupId))
      .reduce((sum, [, value]) => sum + value, 0);
    return {
      name: teacher.full_name,
      groups: `${teacherGroupIds.length} guruh`,
      revenue: `${formatMoney(amount)} so'm`,
      initials: initials(teacher.full_name),
    };
  }).slice(0, 6);

  const weeklyAttendance = groupAttendanceByWeek(attendance);

  const heatmapDays = Array.from({ length: 14 }, (_, index) => addDays(new Date(), index - 13));
  const heatmapRows = activeGroups.slice(0, 6).map((group) => ({
    name: group.name,
    cells: heatmapDays.map((date) => {
      const key = isoDate(date);
      const rows = attendance.filter((row) => row.group_id === group.id && row.date === key);
      const value = rows.length ? pct(rows.filter((row) => row.status === 'present').length, rows.length) : null;
      return { value, bg: heatmapBg(value), tip: value === null ? 'Belgilanmagan' : `${value}%` };
    }),
  }));

  const examCards = exams.slice(0, 5).map((exam) => {
    const rows = examResults.filter((result) => result.exam_id === exam.id);
    const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0;
    const scorePct = pct(average, exam.max_score || 100);
    return {
      name: exam.title,
      score: rows.length ? `${average}/${exam.max_score}` : "Natija yo'q",
      pct: scorePct,
      passRate: rows.length ? `${pct(rows.filter((row) => pct(row.score, exam.max_score || 100) >= 60).length, rows.length)}%` : '0%',
      color: statusColor(scorePct),
    };
  });

  const teacherWorkload = activeTeachers.map((teacher) => {
    const teacherGroupIds = assignments.filter((assignment) => assignment.teacher_id === teacher.id).map((assignment) => assignment.group_id);
    const studentTotal = activeStudents.filter((student) => student.group_id && teacherGroupIds.includes(student.group_id)).length;
    return {
      name: teacher.full_name,
      initials: initials(teacher.full_name),
      groups: teacherGroupIds.length,
      hours: teacherGroupIds.length * 6,
      students: studentTotal,
    };
  }).slice(0, 6);

  return {
    dateLabel: safeDateLabel(new Date()),
    periodLabel: 'Joriy oy',
    kpis: [
      { label: "Faol o'quvchilar", value: activeStudents.length.toString(), accent: '#F5B800', trend: `+${activeStudents.length}`, sub: 'jami faol' },
      { label: 'Bugungi davomat', value: todayAttendance.length ? `${attendancePct}%` : '-', accent: '#16a34a', trend: `${presentToday}/${todayAttendance.length}`, sub: 'belgilangan' },
      { label: 'Oylik daromad', value: `${formatMoney(paidTotal)} so'm`, accent: '#F5B800', trend: `${collectionPct}%`, sub: "to'langan" },
      { label: "Muddati o'tgan", value: `${formatMoney(overdueTotal)} so'm`, accent: '#dc2626', trend: `${overduePayments.length} ta`, sub: "to'lov kutilmoqda" },
    ],
    revenueBars: groupPaymentsByMonth(payments),
    collection: {
      pct: collectionPct,
      paid: `${formatMoney(paidTotal)} so'm`,
      pending: `${formatMoney(pendingTotal)} so'm`,
      overdue: `${formatMoney(overdueTotal)} so'm`,
    },
    attendanceByGroup,
    groupCapacity,
    payments: {
      total: monthPayments.length,
      paid: monthPayments.filter((payment) => payment.status === 'paid').length,
      pending: monthPayments.filter((payment) => payment.status === 'pending').length,
      overdue: overduePayments.length,
      revenueByGroup,
      overdueRows,
      revenueByTeacher,
    },
    attendance: {
      stats: [
        { label: 'Kelganlar', value: presentToday.toString(), sub: 'bugun', color: '#16a34a' },
        { label: 'Kelmaganlar', value: absentToday.toString(), sub: 'bugun', color: '#dc2626' },
        { label: 'Kechikkanlar', value: lateToday.toString(), sub: 'bugun', color: '#F5B800' },
        { label: 'Jami belgilangan', value: todayAttendance.length.toString(), sub: `${attendancePct}% davomat`, color: '#1A1A1A' },
      ],
      weekly: weeklyAttendance,
      byGroup: attendanceByGroup,
      heatmapDays: heatmapDays.map((date) => String(date.getDate())),
      heatmapRows,
    },
    analytics: {
      kpis: [
        { label: 'Jami guruhlar', value: activeGroups.length.toString(), trend: `${activeTeachers.length} ustoz`, sub: 'faol' },
        { label: "O'rtacha hajm", value: activeGroups.length ? Math.round(activeStudents.length / activeGroups.length).toString() : '0', trend: "o'quvchi", sub: 'har guruhda' },
        { label: 'Saqlanish', value: `${pct(activeStudents.length, students.length)}%`, trend: `${activeStudents.length}/${students.length}`, sub: 'faol' },
        { label: 'Imtihonlar', value: exams.length.toString(), trend: `${examResults.length} natija`, sub: 'kiritilgan' },
      ],
      exams: examCards,
      teacherWorkload,
    },
  };
}

export default async function BoshqaruvPage() {
  const data = await getDashboardData();
  return <BoshqaruvClient data={data} />;
}
