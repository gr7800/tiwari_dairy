import { createClient } from "@/lib/supabase/server";
import { ShiftList } from "@/components/settings/ShiftList";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default async function ShiftsSettingsPage() {
  const supabase = createClient();
  const { data: shifts } = await supabase
    .from("shift_configs")
    .select("id, name, start_time, end_time, sort_order")
    .order("sort_order");

  return (
    <div className="max-w-2xl space-y-6">
      <SettingsNav active="shifts" />
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Shifts</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Time windows that drive automatic shift selection on purchase and supply forms (rule #3). The user can
          always override the suggested shift manually.
        </p>
      </div>
      <ShiftList shifts={shifts ?? []} />
    </div>
  );
}
