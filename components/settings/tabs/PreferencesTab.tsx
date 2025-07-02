// components/settings/tabs/PreferencesTab.tsx

import { useTheme } from "@/components/ThemeProvider";
import { EditableField, SelectField } from "../fields";
import { PreferencesTabProps } from "@/lib/types";
import moment from 'moment-timezone';
import { Theme } from "@/app/generated/prisma";

export function PreferencesTab({ preferences, onSave }: PreferencesTabProps) {
  const { theme, setTheme } = useTheme();
  const themeOptions = [
    { value: "LIGHT", label: "Light" },
    { value: "DARK", label: "Dark" },
    { value: "SYSTEM", label: "System Default" },
  ];

  const languageOptions = [
    { value: "en-us", label: "English (US)" },
    // { value: "es-es", label: "Español (España)" },
    // { value: "fr-fr", label: "Français (France)" },
  ];

  const timeZoneOptions = moment.tz.names().map(tz => ({ value: tz, label: tz }));

  return (
    <div>
      <SelectField label="Theme" value={theme} onSave={(v) => setTheme(v as Theme)} options={themeOptions} />
      <SelectField label="Language" value={preferences.language} onSave={(v: string) => onSave("language", v)} options={languageOptions} />
      <SelectField label="Timezone" value={preferences.timezone} onSave={(v: string) => onSave("timezone", v)} options={timeZoneOptions} />
      {/* <EditableField label="Timezone" value={preferences.timezone} onSave={(v: string) => onSave("timezone", v)} placeholder="e.g., Europe/London" /> */}
      <EditableField label="Company" value={preferences.company} onSave={(v: string) => onSave("company", v)} placeholder="Your company name" />
    </div>
  );
}
