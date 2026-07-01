"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Share2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { GhlAccount } from "@/lib/types";
import { PlatformBadge } from "./Badges";

export function AccountList() {
  const [accounts, setAccounts] = useState<GhlAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<{ accounts: GhlAccount[] }>(
          "/api/ghl/accounts"
        );
        setAccounts(data.accounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading accounts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <Share2 className="mx-auto h-10 w-10 text-muted" />
        <p className="mt-3 font-medium text-slate-700">No accounts connected</p>
        <p className="mt-1 text-sm text-muted">
          Connect social accounts in your GoHighLevel Sub-Account under Marketing
          → Social Planner.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {account.name}
              </p>
              <div className="mt-2">
                <PlatformBadge platform={account.platform} />
              </div>
            </div>
            {account.isExpired && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                <AlertTriangle className="h-3 w-3" />
                Expired
              </span>
            )}
          </div>
          {account.type && (
            <p className="mt-3 text-xs text-muted capitalize">
              Type: {account.type}
            </p>
          )}
          {account.expire && (
            <p className="mt-1 text-xs text-muted">
              Token expires:{" "}
              {new Date(account.expire).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
