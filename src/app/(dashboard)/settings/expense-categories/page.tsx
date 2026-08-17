import { createClient } from "@/lib/supabase/server";
import { createExpenseCategory, toggleExpenseCategoryStatus } from "@/lib/actions/expenseCategories";
import { SimpleMasterList } from "@/components/settings/SimpleMasterList";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default async function ExpenseCategoriesSettingsPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("expense_categories").select("id, name, status").order("name");

  return (
    <div className="max-w-2xl space-y-6">
      <SettingsNav active="expense-categories" />
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Expense Categories</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Categories used when recording business expenses.</p>
      </div>
      <SimpleMasterList
        items={categories ?? []}
        createAction={createExpenseCategory}
        toggleAction={toggleExpenseCategoryStatus}
        placeholder="e.g. Fuel"
      />
    </div>
  );
}
