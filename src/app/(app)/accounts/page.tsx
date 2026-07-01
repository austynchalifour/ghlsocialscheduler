import { AccountList } from "@/components/AccountList";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Connected Accounts</h1>
        <p className="mt-1 text-sm text-muted">
          Social media accounts linked to your GoHighLevel location.
        </p>
      </div>
      <AccountList />
    </div>
  );
}
