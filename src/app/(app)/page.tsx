"use client";

import { useState } from "react";
import Link from "next/link";
import { PenSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { PostList } from "@/components/PostList";
import type { PostFilterType } from "@/lib/types";

const filters: { value: PostFilterType; label: string; icon: typeof Clock }[] = [
  { value: "all", label: "All", icon: Clock },
  { value: "scheduled", label: "Scheduled", icon: Clock },
  { value: "published", label: "Published", icon: CheckCircle },
  { value: "draft", label: "Drafts", icon: PenSquare },
  { value: "failed", label: "Failed", icon: AlertCircle },
];

export default function DashboardPage() {
  const [filter, setFilter] = useState<PostFilterType>("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            View and manage your scheduled social media posts.
          </p>
        </div>
        <Link
          href="/compose"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <PenSquare className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === value
                ? "bg-primary text-white"
                : "bg-card text-slate-600 border border-border hover:bg-slate-50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <PostList
        filter={filter}
        onEdit={(post) => {
          window.location.href = `/compose?edit=${post._id}`;
        }}
      />
    </div>
  );
}
