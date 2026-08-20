import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddFarmerForm } from "@/components/forms/AddFarmerForm";
import { FarmerStatusToggle } from "@/components/farmers/FarmerStatusToggle";
import { EditFarmerButton } from "@/components/farmers/EditFarmerButton";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 20;

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const supabase = createClient();
  const search = searchParams.search?.trim();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const rangeStart = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("farmers")
    .select("id, farmer_code, name, phone, address, status", { count: "exact" })
    .order("farmer_code");
  if (search) {
    query = query.or(`farmer_code.ilike.%${search}%,name.ilike.%${search}%`);
  }
  const { data: farmers, count: totalCount } = await query.range(rangeStart, rangeStart + PAGE_SIZE - 1);
  const rows = farmers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Farmers</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage farmer records. Search by code or name.</p>
      </div>

      <AddFarmerForm />

      <form className="max-w-xs rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <Input type="search" name="search" placeholder="Search by code or name" defaultValue={search} />
      </form>

      {/* Desktop: data table. Mobile gets its own stacked-card list below —
          a horizontally-scrolling table is a well-known mobile UX anti-pattern
          for anything beyond occasional secondary use, and this app's primary
          use case is a phone in hand at the collection point. */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Phone</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((farmer) => (
              <tr key={farmer.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">{farmer.farmer_code}</td>
                <td className="px-4 py-2.5">
                  <Link href={`/farmers/${farmer.id}/ledger`} className="text-accent hover:underline">
                    {farmer.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{farmer.phone ?? "—"}</td>
                <td className="px-4 py-2.5">{farmer.status === "INACTIVE" && <Badge>Inactive</Badge>}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <EditFarmerButton farmer={farmer} />
                    <FarmerStatusToggle id={farmer.id} status={farmer.status} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No farmers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {rows.map((farmer) => (
          <div
            key={farmer.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
                  {farmer.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <Link href={`/farmers/${farmer.id}/ledger`} className="font-medium text-accent hover:underline">
                    {farmer.name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{farmer.farmer_code}</p>
                </div>
              </div>
              {farmer.status === "INACTIVE" && <Badge>Inactive</Badge>}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-sm dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">{farmer.phone ?? "No phone"}</span>
              <div className="flex items-center gap-3">
                <EditFarmerButton farmer={farmer} />
                <FarmerStatusToggle id={farmer.id} status={farmer.status} />
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No farmers found.
          </p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount ?? 0} searchParams={searchParams} />
    </div>
  );
}
