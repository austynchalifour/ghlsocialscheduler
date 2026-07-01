import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await createUser(email, password, name);
    await createSession({ userId: user.id, email: user.email });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}
