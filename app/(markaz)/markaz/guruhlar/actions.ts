'use server';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createGroup(formData: FormData) {
  const db = createServerClient();
  const name = (formData.get('name') as string).trim();
  const program_id = Number(formData.get('program_id'));
  const teacher_id = formData.get('teacher_id') ? Number(formData.get('teacher_id')) : null;
  const schedule_days = (formData.get('schedule_days') as string)
    .split(',').map(d => d.trim()).filter(Boolean);
  const schedule_time = (formData.get('schedule_time') as string).trim();
  const max_students = formData.get('max_students') ? Number(formData.get('max_students')) : 15;

  let teacher_name = '';
  if (teacher_id) {
    const { data: t } = await db.from('teachers').select('full_name').eq('id', teacher_id).single();
    teacher_name = t?.full_name ?? '';
  }

  const { data: group, error } = await db.from('groups').insert({
    name, program_id, schedule_days, schedule_time, max_students, branch_id: 1, teacher_name,
  }).select('id').single();
  if (error) throw new Error(error.message);

  if (teacher_id && group) {
    await db.from('teacher_groups').delete().in('group_id', [group.id]);
    await db.from('teacher_groups').insert({ teacher_id, group_id: group.id });
  }
  revalidatePath('/markaz/guruhlar');
  revalidatePath('/markaz/oqituvchilar');
}

export async function updateGroup(id: number, formData: FormData) {
  const db = createServerClient();
  const name = (formData.get('name') as string).trim();
  const teacher_id = formData.get('teacher_id') ? Number(formData.get('teacher_id')) : null;
  const schedule_days = (formData.get('schedule_days') as string)
    .split(',').map(d => d.trim()).filter(Boolean);
  const schedule_time = (formData.get('schedule_time') as string).trim();
  const max_students = formData.get('max_students') ? Number(formData.get('max_students')) : 15;
  const status = formData.get('status') as string;

  let teacher_name = '';
  if (teacher_id) {
    const { data: t } = await db.from('teachers').select('full_name').eq('id', teacher_id).single();
    teacher_name = t?.full_name ?? '';
  }

  await db.from('groups').update({ name, schedule_days, schedule_time, max_students, status, teacher_name }).eq('id', id);

  if (teacher_id) {
    await db.from('teacher_groups').delete().eq('group_id', id);
    await db.from('teacher_groups').insert({ teacher_id, group_id: id });
  }
  revalidatePath('/markaz/guruhlar');
  revalidatePath('/markaz/oqituvchilar');
}

export async function deleteGroup(id: number) {
  const db = createServerClient();
  await db.from('groups').delete().eq('id', id);
  revalidatePath('/markaz/guruhlar');
}

export async function moveStudentToGroup(studentId: number, groupId: number | null) {
  const db = createServerClient();
  await db.from('students').update({ group_id: groupId }).eq('id', studentId);
  revalidatePath('/markaz/guruhlar');
  revalidatePath('/markaz/oquvchilar');
}
