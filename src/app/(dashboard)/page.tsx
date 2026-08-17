import { getDashboardSummary } from "@/lib/dashboardSummary";
import { StatTile } from "@/components/dashboard/StatTile";
import { ValueBarChart } from "@/components/dashboard/ValueBarChart";
import { FarmerStatusDonut } from "@/components/dashboard/FarmerStatusDonut";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const { from, to } = searchParams;
  const summary = await getDashboardSummary({ from, to });
  const { milk, totalExpenses, grossProfit, farmerStatusCounts } = summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Business overview. Filter by date to see a specific period.</p>
      </div>

      <form className="flex flex-wrap items-end gap-3">
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Milk Purchased" value={`${milk.purchasedQuantity.toFixed(1)} L`} />
        <StatTile label="Milk Purchase Cost" value={`₹${milk.purchasedValue.toFixed(2)}`} />
        <StatTile label="Milk Supplied" value={`${milk.suppliedQuantity.toFixed(1)} L`} />
        <StatTile label="Milk Supply Revenue" value={`₹${milk.suppliedValue.toFixed(2)}`} />
        <StatTile label="Total Expenses" value={`₹${totalExpenses.toFixed(2)}`} />
        <StatTile
          label={grossProfit >= 0 ? "Gross Profit" : "Gross Loss"}
          value={`₹${Math.abs(grossProfit).toFixed(2)}`}
          tone={grossProfit >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 font-heading text-sm font-semibold text-slate-700 dark:text-slate-300">Cost vs Revenue vs Expenses</h2>
          <ValueBarChart
            purchaseValue={milk.purchasedValue}
            supplyValue={milk.suppliedValue}
            totalExpenses={totalExpenses}
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 font-heading text-sm font-semibold text-slate-700 dark:text-slate-300">Farmer Payment Status (overall)</h2>
          <FarmerStatusDonut
            paid={farmerStatusCounts.PAID}
            partiallyPaid={farmerStatusCounts.PARTIALLY_PAID}
            unpaid={farmerStatusCounts.UNPAID}
          />
        </div>
      </div>
    </div>
  );
}
