import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/farmers", label: "Farmers" },
  { href: "/purchases", label: "Milk Purchases" },
  { href: "/payments", label: "Farmer Payments" },
  { href: "/supplies", label: "Milk Supply" },
  { href: "/expenses", label: "Expenses" },
  { href: "/settings/milk-types", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orgName = "Tiwari Dairy";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, organizations(name)")
      .eq("id", user.id)
      .single();
    const org = profile?.organizations as unknown as { name: string } | null;
    if (org?.name) orgName = org.name;
  }

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <DashboardShell orgName={orgName} navItems={navItems} signOutAction={signOut} today={today}>
      {children}
    </DashboardShell>
  );
}
