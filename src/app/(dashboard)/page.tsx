import { getDashboardSummary } from "@/lib/dashboardSummary";
import { StatTile } from "@/components/dashboard/StatTile";
import { ValueBarChart } from "@/components/dashboard/ValueBarChart";
import { FarmerStatusDonut } from "@/components/dashboard/FarmerStatusDonut";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

function iconProps() {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

function DropletIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 2.5s6 6.6 6 11a6 6 0 1 1-12 0c0-4.4 6-11 6-11Z" />
    </svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 7l6 6 4-4 8 8" />
      <path d="M15 17h6v-6" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M21 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h12" />
      <path d="M17 13h.01" />
    </svg>
  );
}

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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Milk Purchased" value={`${milk.purchasedQuantity.toFixed(1)} L`} icon={<DropletIcon />} />
        <StatTile label="Milk Purchase Cost" value={`₹${milk.purchasedValue.toFixed(2)}`} icon={<TrendingDownIcon />} />
        <StatTile label="Milk Supplied" value={`${milk.suppliedQuantity.toFixed(1)} L`} icon={<DropletIcon />} />
        <StatTile label="Milk Supply Revenue" value={`₹${milk.suppliedValue.toFixed(2)}`} icon={<TrendingUpIcon />} />
        <StatTile label="Total Expenses" value={`₹${totalExpenses.toFixed(2)}`} icon={<ReceiptIcon />} />
        <StatTile
          label={grossProfit >= 0 ? "Gross Profit" : "Gross Loss"}
          value={`₹${Math.abs(grossProfit).toFixed(2)}`}
          tone={grossProfit >= 0 ? "positive" : "negative"}
          icon={<WalletIcon />}
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
