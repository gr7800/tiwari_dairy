import { SettingsNav } from "@/components/settings/SettingsNav";
import { AppearanceThemeGrid } from "@/components/settings/AppearanceThemeGrid";

export default function AppearanceSettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <SettingsNav active="appearance" />
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Appearance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize how Tiwari Dairy looks on this device. Changes apply instantly and are remembered next time you sign in.
        </p>
      </div>
      <AppearanceThemeGrid />
    </div>
  );
}
