import { NextRequest, NextResponse } from "next/server";
import {
  deleteGhlConnection,
  getGhlCredentialsForUser,
  saveGhlConnection,
} from "@/lib/auth";
import { resolveCredentialsFromValues } from "@/lib/config";
import { testConnection } from "@/lib/ghl-client";
import { getSession } from "@/lib/session";
import { GhlApiError } from "@/lib/ghl-client";

async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const creds = await getGhlCredentialsForUser(session.userId);
  if (!creds) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    locationId: creds.locationId,
    hasToken: true,
  });
}

export async function PUT(request: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { locationId, apiToken } = await request.json();
  if (!locationId) {
    return NextResponse.json(
      { error: "Location ID is required." },
      { status: 400 }
    );
  }

  const existing = await getGhlCredentialsForUser(session.userId);
  const tokenToUse = apiToken?.trim() || existing?.token;

  if (!tokenToUse) {
    return NextResponse.json(
      { error: "API token is required for a new connection." },
      { status: 400 }
    );
  }

  try {
    const creds = await resolveCredentialsFromValues(locationId, tokenToUse);
    await testConnection(creds);
    const connection = await saveGhlConnection(
      session.userId,
      locationId,
      tokenToUse
    );
    return NextResponse.json({
      connected: true,
      locationId: connection.locationId,
      updatedAt: connection.updatedAt,
    });
  } catch (err) {
    if (err instanceof GhlApiError) {
      return NextResponse.json(
        { error: err.message, details: err.body },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Failed to save connection." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  let creds;

  if (body.locationId && body.apiToken) {
    creds = await resolveCredentialsFromValues(body.locationId, body.apiToken);
  } else {
    creds = await getGhlCredentialsForUser(session.userId);
    if (!creds) {
      return NextResponse.json(
        { error: "No GoHighLevel connection configured." },
        { status: 400 }
      );
    }
  }

  try {
    const result = await testConnection(creds);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GhlApiError) {
      return NextResponse.json(
        { error: err.message, connected: false },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Connection test failed", connected: false },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await deleteGhlConnection(session.userId);
  return NextResponse.json({ connected: false });
}
