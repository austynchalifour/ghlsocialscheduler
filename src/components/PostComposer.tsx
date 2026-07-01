"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  ImagePlus,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  CreatePostPayload,
  GhlAccount,
  GhlPost,
  GhlMedia,
  PostType,
} from "@/lib/types";
import { PlatformBadge } from "./Badges";

interface PostComposerProps {
  editPost?: GhlPost | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PostComposer({
  editPost,
  onSuccess,
  onCancel,
}: PostComposerProps) {
  const [accounts, setAccounts] = useState<GhlAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [postType, setPostType] = useState<PostType>("post");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">(
    "scheduled"
  );
  const [scheduleDate, setScheduleDate] = useState("");
  const [followUpComment, setFollowUpComment] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await apiFetch<{ accounts: GhlAccount[] }>(
          "/api/ghl/accounts"
        );
        setAccounts(data.accounts.filter((a) => !a.isExpired));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load accounts"
        );
      } finally {
        setLoadingAccounts(false);
      }
    }
    loadAccounts();
  }, []);

  useEffect(() => {
    if (!editPost) return;
    setSummary(editPost.summary ?? "");
    setSelectedAccounts(editPost.accountIds ?? []);
    setPostType((editPost.type as PostType) ?? "post");
    const postStatus = String(editPost.status);
    if (
      postStatus === "draft" ||
      postStatus === "scheduled" ||
      postStatus === "published"
    ) {
      setStatus(postStatus);
    }
    if (editPost.displayDate) {
      const d = new Date(editPost.displayDate);
      setScheduleDate(format(d, "yyyy-MM-dd'T'HH:mm"));
    }
    if (editPost.media?.length) {
      setMediaUrls(editPost.media.map((m) => m.url));
    }
  }, [editPost]);

  function toggleAccount(id: string) {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function buildMedia(): GhlMedia[] {
    return mediaUrls
      .filter((url) => url.trim())
      .map((url) => ({
        url: url.trim(),
        type: url.match(/\.(mp4|mov|webm)$/i) ? "video/mp4" : "image/jpeg",
      }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedAccounts.length === 0) {
      setError("Select at least one social account.");
      return;
    }
    if (!summary.trim()) {
      setError("Post content is required.");
      return;
    }
    if (status === "scheduled" && !scheduleDate) {
      setError("Schedule date is required for scheduled posts.");
      return;
    }

    const payload: CreatePostPayload = {
      accountIds: selectedAccounts,
      type: postType,
      summary: summary.trim(),
      status,
      ...(status === "scheduled" && scheduleDate
        ? { scheduleDate: new Date(scheduleDate).toISOString() }
        : {}),
      ...(followUpComment ? { followUpComment } : {}),
      ...(buildMedia().length ? { media: buildMedia() } : {}),
    };

    setLoading(true);
    try {
      if (editPost) {
        await apiFetch(`/api/ghl/posts/${editPost._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/ghl/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSuccess?.();
      if (!editPost) {
        setSummary("");
        setSelectedAccounts([]);
        setMediaUrls([""]);
        setFollowUpComment("");
        setScheduleDate("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setLoading(false);
    }
  }

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center py-12 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading accounts...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Select Accounts
        </h3>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted">
            No connected accounts found. Connect social accounts in GoHighLevel
            first.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {accounts.map((account) => {
              const selected = selectedAccounts.includes(account.id);
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => toggleAccount(account.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      selected
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {selected && (
                      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M10.28 2.28a.75.75 0 00-1.06-1.06L4.5 6.94 2.78 5.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{account.name}</p>
                    <PlatformBadge platform={account.platform} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Content</h3>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
          placeholder="Write your post content..."
          className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-muted">{summary.length} characters</p>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-muted" />
          <h3 className="text-sm font-semibold text-slate-900">Media URLs</h3>
        </div>
        <p className="mb-3 text-xs text-muted">
          Add publicly accessible HTTPS URLs for images or videos.
        </p>
        <div className="space-y-2">
          {mediaUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const next = [...mediaUrls];
                  next[i] = e.target.value;
                  setMediaUrls(next);
                }}
                placeholder="https://example.com/image.jpg"
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {mediaUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setMediaUrls(mediaUrls.filter((_, j) => j !== i))
                  }
                  className="rounded-lg p-2 text-muted hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMediaUrls([...mediaUrls, ""])}
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            + Add another media URL
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Scheduling</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Post Type
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="post">Post</option>
              <option value="story">Story</option>
              <option value="reel">Reel</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "scheduled" | "published")
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Publish Now</option>
            </select>
          </div>
          {status === "scheduled" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                <Calendar className="mr-1 inline h-3 w-3" />
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Follow-up Comment (optional)
          </label>
          <input
            type="text"
            value={followUpComment}
            onChange={(e) => setFollowUpComment(e.target.value)}
            placeholder="First comment on the post..."
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {editPost ? "Update Post" : status === "published" ? "Publish" : "Schedule Post"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
