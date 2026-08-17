"use client";

import "@/lib/chartSetup";
import { Doughnut } from "react-chartjs-2";

export function FarmerStatusDonut({
  paid,
  partiallyPaid,
  unpaid,
}: {
  paid: number;
  partiallyPaid: number;
  unpaid: number;
}) {
  const total = paid + partiallyPaid + unpaid;

  if (total === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-2xl" aria-hidden="true">
          👥
        </span>
        <p className="text-sm text-slate-400 dark:text-slate-500">No farmers yet</p>
      </div>
    );
  }

  return (
    <Doughnut
      data={{
        labels: ["Paid", "Partially Paid", "Unpaid"],
        datasets: [
          {
            data: [paid, partiallyPaid, unpaid],
            backgroundColor: ["#16a34a", "#d97706", "#dc2626"],
            borderWidth: 0,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      }}
    />
  );
}
