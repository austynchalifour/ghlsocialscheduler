import { NextResponse } from "next/server";
import { resolveUserCredentials } from "@/lib/config";
import { getAccounts } from "@/lib/ghl-client";
import { GhlApiError } from "@/lib/ghl-client";

export async function GET() {
  const creds = await resolveUserCredentials();
  if ("error" in creds) {
    return NextResponse.json(
      { error: creds.error, code: creds.code },
      { status: creds.code === "UNAUTHORIZED" ? 401 : 400 }
    );
  }

  try {
    const { accounts, groups } = await getAccounts(creds);
    return NextResponse.json({ accounts, groups });
  } catch (err) {
    if (err instanceof GhlApiError) {
      return NextResponse.json(
        { error: err.message, details: err.body },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
