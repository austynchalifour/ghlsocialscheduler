import type { Platform } from "@/lib/types";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/types";

export function PlatformBadge({ platform }: { platform?: Platform | string }) {
  if (!platform) return null;
  const color = PLATFORM_COLORS[platform] ?? "bg-slate-500";
  const label = PLATFORM_LABELS[platform] ?? platform;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${color}`}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const colors: Record<string, string> = {
    scheduled: "bg-amber-100 text-amber-800 border-amber-200",
    published: "bg-emerald-100 text-emerald-800 border-emerald-200",
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    in_review: "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
        colors[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
