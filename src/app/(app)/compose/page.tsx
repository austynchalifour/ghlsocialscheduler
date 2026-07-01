"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PostComposer } from "@/components/PostComposer";
import { apiFetch } from "@/lib/api";
import type { GhlPost } from "@/lib/types";
import { Loader2 } from "lucide-react";

function ComposeContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [editPost, setEditPost] = useState<GhlPost | null>(null);
  const [loading, setLoading] = useState(!!editId);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!editId) return;
    async function load() {
      try {
        const data = await apiFetch<{ post: GhlPost }>(
          `/api/ghl/posts/${editId}`
        );
        setEditPost(data.post);
      } catch {
        setEditPost(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [editId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading post...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {editPost ? "Edit Post" : "Compose Post"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Create and schedule posts across your connected social accounts.
        </p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Post saved successfully!{" "}
          <a href="/" className="font-semibold underline">
            View dashboard
          </a>
        </div>
      )}

      <PostComposer
        editPost={editPost}
        onSuccess={() => setSuccess(true)}
        onCancel={editPost ? () => (window.location.href = "/") : undefined}
      />
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
      }
    >
      <ComposeContent />
    </Suspense>
  );
}
