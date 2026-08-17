"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createShift, updateShiftWindow, type MasterDataActionState } from "@/lib/actions/shifts";
import { useActionToast } from "@/hooks/useActionToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  sort_order: number;
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding…" : "Add shift"}
    </Button>
  );
}

function ShiftRow({ shift }: { shift: Shift }) {
  const [startTime, setStartTime] = useState(shift.start_time);
  const [endTime, setEndTime] = useState(shift.end_time);
  const [isPending, startTransition] = useTransition();
  const dirty = startTime !== shift.start_time || endTime !== shift.end_time;

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="w-28 text-sm font-medium text-slate-900 dark:text-slate-100">{shift.name}</span>
      <div className="flex items-center gap-2">
        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-32" />
        <span className="text-sm text-slate-400 dark:text-slate-500">to</span>
        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-32" />
      </div>
      <button
        type="button"
        disabled={!dirty || isPending}
        onClick={() =>
          startTransition(() => {
            updateShiftWindow(shift.id, startTime, endTime).then((result) => {
              if (result?.error) toast.error(result.error);
              else toast.success("Shift updated");
            });
          })
        }
        className="text-sm text-accent hover:underline disabled:opacity-40"
      >
        Save
      </button>
    </li>
  );
}

export function ShiftList({ shifts }: { shifts: Shift[] }) {
  const initialState: MasterDataActionState = {};
  const [state, formAction] = useFormState(createShift, initialState);
  useActionToast(state, "Shift added");

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
        {shifts.map((shift) => (
          <ShiftRow key={shift.id} shift={shift} />
        ))}
        {shifts.length === 0 && <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No shifts configured yet.</li>}
      </ul>

      <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-slate-300 p-3 dark:border-slate-600">
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Name</label>
          <Input name="name" placeholder="e.g. Night" required className="w-32" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Start</label>
          <Input type="time" name="startTime" required className="w-32" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">End</label>
          <Input type="time" name="endTime" required className="w-32" />
        </div>
        <input type="hidden" name="sortOrder" value={shifts.length} />
        <AddButton />
      </form>
    </div>
  );
}
