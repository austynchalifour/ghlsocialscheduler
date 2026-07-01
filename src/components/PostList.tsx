"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Loader2,
  RefreshCw,
  Trash2,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { GhlPost, PostFilterType } from "@/lib/types";
import { PlatformBadge, StatusBadge } from "./Badges";

interface PostListProps {
  filter?: PostFilterType;
  onEdit?: (post: GhlPost) => void;
  refreshKey?: number;
}

export function PostList({ filter = "all", onEdit, refreshKey = 0 }: PostListProps) {
  const [posts, setPosts] = useState<GhlPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ posts: GhlPost[] }>(
        `/api/ghl/posts?type=${filter}`
      );
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [filter, refreshKey]);

  async function handleDelete(postId: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(postId);
    try {
      await apiFetch(`/api/ghl/posts/${postId}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">{error}</p>
        <button
          onClick={loadPosts}
          className="mt-3 text-sm font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <p className="text-muted">No posts found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={loadPosts}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-slate-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {posts.map((post) => (
        <article
          key={post._id}
          className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <PlatformBadge platform={post.platform} />
                <StatusBadge status={String(post.status)} />
                {post.type && (
                  <span className="text-xs text-muted capitalize">
                    {post.type}
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-slate-800">
                {post.summary || (
                  <span className="italic text-muted">No caption</span>
                )}
              </p>

              {post.media && post.media.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {post.media.length} media file
                  {post.media.length > 1 ? "s" : ""}
                </div>
              )}

              <p className="text-xs text-muted">
                {post.displayDate
                  ? format(new Date(post.displayDate), "MMM d, yyyy 'at' h:mm a")
                  : post.createdAt
                    ? format(new Date(post.createdAt), "MMM d, yyyy")
                    : "—"}
              </p>

              {post.error && (
                <p className="text-xs text-red-600">{post.error}</p>
              )}
            </div>

            <div className="flex shrink-0 gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(post)}
                  className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-slate-700"
                  title="Edit post"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(post._id)}
                disabled={deletingId === post._id}
                className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Delete post"
              >
                {deletingId === post._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
