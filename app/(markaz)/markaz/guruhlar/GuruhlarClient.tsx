'use client';
import { useState, useTransition } from 'react';
import { createGroup, updateGroup, deleteGroup, moveStudentToGroup } from './actions';
import { Select } from '@/components/shared/Select';

type Group = {
  id: number; name: string; teacher_name: string | null; teacher_id: number | null;
  schedule_days: string[]; schedule_time: string | null;
  max_students: number; status: string;
};
type Student = { id: number; full_name: string; group_id: number | null };
type Teacher = { id: number; full_name: string };
type Program = { id: number; name_uz: string };

export function GuruhlarClient({
  groups, students, studentCounts, teachers, programs,
}: {
  groups: Group[]; students: Student[]; studentCounts: Record<number, number>;
  teachers: Teacher[]; programs: Program[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [moveStudent, setMoveStudent] = useState<Student | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await createGroup(fd); setShowAdd(false); });
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editGroup) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await updateGroup(editGroup.id, fd); setEditGroup(null); });
  }

  function handleDelete(id: number) {
    if (!confirm("Guruhni o'chirishni tasdiqlaysizmi?")) return;
    startTransition(async () => { await deleteGroup(id); });
  }

  function handleMove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!moveStudent) return;
    const fd = new FormData(e.currentTarget);
    const groupId = fd.get('group_id') ? Number(fd.get('group_id')) : null;
    startTransition(async () => { await moveStudentToGroup(moveStudent.id, groupId); setMoveStudent(null); });
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-5">
        <button
          onClick={() => setShowAdd(true)}
          className="shrink-0 px-5 py-2 rounded-xl bg-[#F5B800] text-[#1A1A1A] text-sm font-semibold hover:bg-[#D4970A] transition-colors"
        >
          + Guruh qo&apos;shish
        </button>
        <Select
          className="flex-1 min-w-[200px]"
          value=""
          onChange={val => {
            if (!val) return;
            const s = students.find(st => st.id === Number(val));
            if (s) setMoveStudent(s);
          }}
          placeholder="O'quvchini guruhga ko'chirish..."
          options={students.map(s => ({ value: String(s.id), label: s.full_name }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
            Guruhlar yo&apos;q
          </div>
        ) : groups.map(g => (
          <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-[#1A1A1A]">{g.name}</p>
                <p className={`text-xs mt-0.5 ${g.teacher_name ? 'text-gray-400' : 'text-amber-500 font-medium'}`}>
                  {g.teacher_name ?? 'Tayinlanmagan'}
                </p>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                g.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {g.status === 'active' ? 'Faol' : 'Arxiv'}
              </span>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-xs text-gray-500">
                {g.schedule_days?.join(', ') || '—'} {g.schedule_time ? `· ${g.schedule_time}` : ''}
              </p>
              <p className="text-xs text-gray-500">
                {studentCounts[g.id] ?? 0} / {g.max_students} o&apos;quvchi
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditGroup(g)} className="text-xs text-gray-400 hover:text-[#F5B800] transition-colors">Tahrirlash</button>
              <button onClick={() => handleDelete(g.id)} className="text-xs text-gray-400 hover:text-red-600 transition-colors">O&apos;chirish</button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal title="Yangi guruh" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Guruh nomi" name="name" required />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Yo&apos;nalish</label>
              <Select name="program_id" required placeholder="— tanlang —"
                options={programs.map(p => ({ value: String(p.id), label: p.name_uz }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">O&apos;qituvchi</label>
              <Select name="teacher_id" placeholder="Tayinlanmagan"
                options={teachers.map(t => ({ value: String(t.id), label: t.full_name }))} />
            </div>
            <Field label="Dars kunlari (vergul bilan)" name="schedule_days" placeholder="Du, Cho, Ju" />
            <Field label="Dars vaqti" name="schedule_time" placeholder="14:00–15:30" />
            <Field label="Max o'quvchilar" name="max_students" type="number" defaultValue="15" />
            <SubmitBtn pending={isPending} label="Saqlash" />
          </form>
        </Modal>
      )}

      {editGroup && (
        <Modal title="Guruhni tahrirlash" onClose={() => setEditGroup(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Field label="Guruh nomi" name="name" defaultValue={editGroup.name} required />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">O&apos;qituvchi</label>
              <Select name="teacher_id" placeholder="Tayinlanmagan"
                defaultValue={editGroup.teacher_id ? String(editGroup.teacher_id) : ''}
                options={teachers.map(t => ({ value: String(t.id), label: t.full_name }))} />
            </div>
            <Field label="Dars kunlari" name="schedule_days" defaultValue={editGroup.schedule_days?.join(', ')} />
            <Field label="Dars vaqti" name="schedule_time" defaultValue={editGroup.schedule_time ?? ''} />
            <Field label="Max o'quvchilar" name="max_students" type="number" defaultValue={String(editGroup.max_students)} />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Holat</label>
              <Select name="status" required defaultValue={editGroup.status}
                options={[{ value: 'active', label: 'Faol' }, { value: 'inactive', label: 'Arxiv' }]} />
            </div>
            <SubmitBtn pending={isPending} label="Saqlash" />
          </form>
        </Modal>
      )}

      {moveStudent && (
        <Modal title={`${moveStudent.full_name} — guruhga ko'chirish`} onClose={() => setMoveStudent(null)}>
          <form onSubmit={handleMove} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Guruh tanlang</label>
              <Select name="group_id" placeholder="Guruhsiz"
                defaultValue={moveStudent.group_id ? String(moveStudent.group_id) : ''}
                options={groups.map(g => ({ value: String(g.id), label: g.name }))} />
            </div>
            <SubmitBtn pending={isPending} label="Ko'chirish" />
          </form>
        </Modal>
      )}
    </>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1A1A1A]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', required, defaultValue, placeholder }: {
  label: string; name: string; type?: string; required?: boolean; defaultValue?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type} name={name} defaultValue={defaultValue} required={required} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#F5B800]"
      />
    </div>
  );
}

function SubmitBtn({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending}
      className="w-full py-2.5 rounded-xl bg-[#F5B800] text-[#1A1A1A] text-sm font-semibold hover:bg-[#D4970A] transition-colors disabled:opacity-50">
      {pending ? 'Saqlanmoqda...' : label}
    </button>
  );
}
