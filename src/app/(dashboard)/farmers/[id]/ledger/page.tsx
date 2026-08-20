import { notFound } from "next/navigation";
import { getFarmerLedgerData } from "@/lib/farmerLedger";
import { createClient } from "@/lib/supabase/server";
import { SettlementSummaryCard } from "@/components/ledger/SettlementSummaryCard";
import { FarmerLedgerTable } from "@/components/ledger/FarmerLedgerTable";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default async function FarmerLedgerPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string; to?: string };
}) {
  const { from, to } = searchParams;
  const supabase = createClient();
  const [ledger, { data: farmers }, { data: milkTypes }, { data: shifts }] = await Promise.all([
    getFarmerLedgerData(params.id, { from, to }),
    supabase.from("farmers").select("id, farmer_code, name").eq("status", "ACTIVE").order("farmer_code"),
    supabase.from("milk_types").select("id, name").eq("status", "ACTIVE").order("name"),
    supabase.from("shift_configs").select("id, name, start_time, end_time, sort_order").order("sort_order"),
  ]);
  if (!ledger) notFound();

  const { farmer, transactions, overall, period } = ledger;
  const hasRange = Boolean(from || to);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">
          {farmer.name} <span className="font-normal text-slate-400 dark:text-slate-500">· {farmer.farmer_code}</span>
        </h1>
        {farmer.phone && <p className="text-sm text-slate-500 dark:text-slate-400">{farmer.phone}</p>}
      </div>

      <form className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">From</label>
          <Input type="date" name="from" defaultValue={from} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">To</label>
          <Input type="date" name="to" defaultValue={to} />
        </div>
        <Button type="submit" variant="secondary">
          Apply filter
        </Button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {period && <SettlementSummaryCard title="Period Summary" summary={period} />}
        <SettlementSummaryCard title="Overall Account Balance" summary={overall} />
      </div>

      {hasRange && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Payments can be made against older purchases — the Period Summary reflects only transactions in the
          selected dates, while Overall Account Balance always reflects the farmer&apos;s complete history.
        </p>
      )}

      <FarmerLedgerTable
        transactions={transactions}
        farmerId={farmer.id}
        farmers={farmers ?? []}
        milkTypes={milkTypes ?? []}
        shifts={shifts ?? []}
      />
    </div>
  );
}
