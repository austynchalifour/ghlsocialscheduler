import { NextResponse } from "next/server";
import { getUserById } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      ghlConnected: !!user.ghlConnection,
      locationId: user.ghlConnection?.locationId ?? null,
    },
  });
}
