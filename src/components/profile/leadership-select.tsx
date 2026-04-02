"use client";

import { useTranslations } from "next-intl";

const STYLES = [
  { value: "patriarchal", labelKey: "leadershipPatriarchal", descKey: "leadershipPatriarchalDesc" },
  { value: "cooperative", labelKey: "leadershipCooperative", descKey: "leadershipCooperativeDesc" },
  { value: "delegative", labelKey: "leadershipDelegative", descKey: "leadershipDelegativeDesc" },
  { value: "coaching", labelKey: "leadershipCoaching", descKey: "leadershipCoachingDesc" },
  { value: "visionary", labelKey: "leadershipVisionary", descKey: "leadershipVisionaryDesc" },
] as const;

interface LeadershipSelectProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function LeadershipSelect({ value, onChange }: LeadershipSelectProps) {
  const t = useTranslations("profile");

  return (
    <div className="space-y-2">
      {STYLES.map((style) => (
        <button
          key={style.value}
          type="button"
          onClick={() => onChange(style.value)}
          className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
            value === style.value
              ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
            value === style.value
              ? "border-brand-primary bg-brand-primary"
              : "border-slate-300"
          }`}>
            {value === style.value && (
              <div className="flex h-full items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{t(style.labelKey)}</div>
            <div className="text-xs text-slate-500 mt-0.5">{t(style.descKey)}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
