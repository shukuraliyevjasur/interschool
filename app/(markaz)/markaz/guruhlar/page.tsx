export const dynamic = 'force-dynamic';
import { createServerClient } from '@/lib/supabase/server';
import { GuruhlarClient } from './GuruhlarClient';

export default async function GuruhlarPage() {
  const db = createServerClient();
  const [{ data: rawGroups }, { data: students }, { data: teachers }, { data: programs }] = await Promise.all([
    db.from('groups')
      .select('id, name, schedule_days, schedule_time, max_students, status, teacher_groups(teacher_id, teachers(full_name))')
      .order('name'),
    db.from('students').select('id, full_name, group_id').eq('status', 'active').order('full_name'),
    db.from('teachers').select('id, full_name').eq('status', 'active').order('full_name'),
    db.from('programs').select('id, name_uz').order('name_uz'),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups = (rawGroups ?? []).map((g: any) => ({
    id: g.id as number,
    name: g.name as string,
    schedule_days: g.schedule_days as string[],
    schedule_time: g.schedule_time as string | null,
    max_students: g.max_students as number,
    status: g.status as string,
    teacher_name: (g.teacher_groups as { teacher_id: number; teachers: { full_name: string } | null }[])[0]?.teachers?.full_name ?? null,
    teacher_id: (g.teacher_groups as { teacher_id: number }[])[0]?.teacher_id ?? null,
  }));

  const studentCounts: Record<number, number> = {};
  for (const s of students ?? []) {
    if (s.group_id) studentCounts[s.group_id] = (studentCounts[s.group_id] ?? 0) + 1;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">INTER SCHOOL</p>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Guruhlar</h1>
        </div>
      </div>
      <GuruhlarClient
        groups={groups}
        students={students ?? []}
        studentCounts={studentCounts}
        teachers={(teachers ?? []) as { id: number; full_name: string }[]}
        programs={(programs ?? []) as { id: number; name_uz: string }[]}
      />
    </div>
  );
}
