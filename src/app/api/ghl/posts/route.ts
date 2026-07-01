import { NextRequest, NextResponse } from "next/server";
import { resolveUserCredentials } from "@/lib/config";
import { createPost, listPosts, GhlApiError } from "@/lib/ghl-client";
import type { CreatePostPayload, ListPostsPayload } from "@/lib/types";

export async function GET(request: NextRequest) {
  const creds = await resolveUserCredentials();
  if ("error" in creds) {
    return NextResponse.json(
      { error: creds.error, code: creds.code },
      { status: creds.code === "UNAUTHORIZED" ? 401 : 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";
  const fromDate =
    searchParams.get("fromDate") ??
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const toDate =
    searchParams.get("toDate") ??
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const limit = searchParams.get("limit") ?? "50";

  const payload: ListPostsPayload = {
    type: type as ListPostsPayload["type"],
    fromDate,
    toDate,
    limit,
    includeUsers: "true",
  };

  try {
    const posts = await listPosts(creds, payload);
    return NextResponse.json({ posts });
  } catch (err) {
    if (err instanceof GhlApiError) {
      return NextResponse.json(
        { error: err.message, details: err.body },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const creds = await resolveUserCredentials();
  if ("error" in creds) {
    return NextResponse.json(
      { error: creds.error, code: creds.code },
      { status: creds.code === "UNAUTHORIZED" ? 401 : 400 }
    );
  }

  try {
    const body = (await request.json()) as CreatePostPayload;
    const post = await createPost(creds, body);
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    if (err instanceof GhlApiError) {
      return NextResponse.json(
        { error: err.message, details: err.body },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
