"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export function CredentialsBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    apiFetch<{ connected: boolean }>("/api/ghl/connection")
      .then((data) => setShow(!data.connected))
      .catch(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-8 py-3 text-sm text-amber-900">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p>
        Connect your GoHighLevel location to start scheduling.{" "}
        <Link href="/settings" className="font-semibold underline">
          Connect in Settings
        </Link>
      </p>
    </div>
  );
}
