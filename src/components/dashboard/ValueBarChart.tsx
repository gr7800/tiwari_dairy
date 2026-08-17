"use client";

import "@/lib/chartSetup";
import { Bar } from "react-chartjs-2";

export function ValueBarChart({
  purchaseValue,
  supplyValue,
  totalExpenses,
}: {
  purchaseValue: number;
  supplyValue: number;
  totalExpenses: number;
}) {
  return (
    <Bar
      data={{
        labels: ["Milk Purchase Cost", "Milk Supply Revenue", "Expenses"],
        datasets: [
          {
            data: [purchaseValue, supplyValue, totalExpenses],
            backgroundColor: ["#dc2626", "#16a34a", "#d97706"],
            borderRadius: 4,
            barThickness: 48,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      }}
    />
  );
}
