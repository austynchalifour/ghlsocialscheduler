"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export function SettingsForm() {
  const [apiToken, setApiToken] = useState("");
  const [locationId, setLocationId] = useState("");
  const [connected, setConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    accountCount?: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [connection, me] = await Promise.all([
          apiFetch<{ connected: boolean; locationId?: string }>(
            "/api/ghl/connection"
          ),
          apiFetch<{
            user: { email: string; name: string | null; locationId: string | null };
          }>("/api/auth/me"),
        ]);
        setConnected(connection.connected);
        setLocationId(
          connection.locationId ?? me.user.locationId ?? ""
        );
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);

    try {
      const result = await apiFetch<{
        connected: boolean;
        locationId: string;
      }>("/api/ghl/connection", {
        method: "PUT",
        body: JSON.stringify({ locationId, apiToken }),
      });
      setConnected(result.connected);
      setLocationId(result.locationId);
      setApiToken("");
      setTestResult({
        success: true,
        message: "GoHighLevel location connected and saved.",
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await apiFetch<{
        connected: boolean;
        accountCount: number;
      }>("/api/ghl/connection", {
        method: "POST",
        body: JSON.stringify(
          apiToken
            ? { locationId, apiToken }
            : {}
        ),
      });
      setTestResult({
        success: true,
        message: "Connection successful",
        accountCount: result.accountCount,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Connection failed",
      });
    } finally {
      setTesting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect your GoHighLevel location?")) return;
    await apiFetch("/api/ghl/connection", { method: "DELETE" });
    setConnected(false);
    setLocationId("");
    setApiToken("");
    setTestResult(null);
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your GoHighLevel Location</h1>
        <p className="mt-1 text-sm text-muted">
          Each account connects to its own GHL Sub-Account. Your location ID and
          API token are stored securely and never shared with other users.
        </p>
      </div>

      {connected && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Connected to location{" "}
          <code className="rounded bg-white/60 px-1.5 font-mono text-xs">
            {locationId}
          </code>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Location ID
          </label>
          <input
            type="text"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            placeholder="ve9EPM428h8vShlRW1KT"
            required
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1.5 text-xs text-muted">
            Your unique GHL Sub-Account ID. Found in Settings → Business
            Profile or in the sub-account URL.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Private Integration Token
          </label>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder={connected ? "••••••••••••••••" : "pit_xxxxxxxxxxxxxxxx"}
            required={!connected}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1.5 text-xs text-muted">
            {connected
              ? "Leave blank to keep your existing token, or enter a new one to update."
              : "Create in GHL: Settings → Private Integrations with socialplanner scopes."}
          </p>
        </div>

        {testResult && (
          <div
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
              testResult.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              <p className="font-medium">{testResult.message}</p>
              {testResult.accountCount !== undefined && (
                <p className="mt-0.5 text-xs">
                  {testResult.accountCount} connected social account
                  {testResult.accountCount !== 1 ? "s" : ""} found.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving || !locationId || (!apiToken && !connected)}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {connected ? "Update Connection" : "Connect Location"}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !locationId || (!apiToken && !connected)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {testing && <Loader2 className="h-4 w-4 animate-spin" />}
            Test Connection
          </button>
          {connected && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Disconnect
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
