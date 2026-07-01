import { NextRequest, NextResponse } from "next/server";
import { resolveUserCredentials } from "@/lib/config";
import { deletePost, getPost, updatePost, GhlApiError } from "@/lib/ghl-client";
import type { CreatePostPayload } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const creds = await resolveUserCredentials();
  if ("error" in creds) {
    return NextResponse.json(
      { error: creds.error, code: creds.code },
      { status: creds.code === "UNAUTHORIZED" ? 401 : 400 }
    );
  }

  const { id } = await context.params;

  try {
    const post = await getPost(creds, id);
    return NextResponse.json({ post });
  } catch (err) {
    if (err instanceof GhlApiError) {
      return NextResponse.json(
        { error: err.message, details: err.body },
        { status: err.statusCode }
      );
    }
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const creds = await resolveUserCredentials();
  if ("error" in creds) {
    return NextResponse.json(
      { error: creds.error, code: creds.code },
      { status: creds.code === "UNAUTHORIZED" ? 401 : 400 }
    );
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Partial<CreatePostPayload>;
    const post = await updatePost(creds, id, body);
    return NextResponse.json({ post });
  } catch (err) {
    if (err instanceof GhlApiError) {
      return NextResponse.json(
        { error: err.message, details: err.body },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const creds = await resolveUserCredentials();
  if ("error" in creds) {
    return NextResponse.json(
      { error: creds.error, code: creds.code },
      { status: creds.code === "UNAUTHORIZED" ? 401 : 400 }
    );
  }

  const { id } = await context.params;

  try {
    await deletePost(creds, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof GhlApiError) {
      return NextResponse.json(
        { error: err.message, details: err.body },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
