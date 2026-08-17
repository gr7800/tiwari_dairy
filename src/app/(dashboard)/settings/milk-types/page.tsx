import { createClient } from "@/lib/supabase/server";
import { createMilkType, toggleMilkTypeStatus } from "@/lib/actions/milkTypes";
import { SimpleMasterList } from "@/components/settings/SimpleMasterList";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default async function MilkTypesSettingsPage() {
  const supabase = createClient();
  const { data: milkTypes } = await supabase.from("milk_types").select("id, name, status").order("name");

  return (
    <div className="max-w-2xl space-y-6">
      <SettingsNav active="milk-types" />
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Milk Types</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configurable milk types used across purchases and supply — add new ones any time.
        </p>
      </div>
      <SimpleMasterList
        items={milkTypes ?? []}
        createAction={createMilkType}
        toggleAction={toggleMilkTypeStatus}
        placeholder="e.g. Goat Milk"
      />
    </div>
  );
}
