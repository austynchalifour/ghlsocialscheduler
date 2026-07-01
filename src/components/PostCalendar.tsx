"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { GhlPost } from "@/lib/types";
import { PlatformBadge, StatusBadge } from "@/components/Badges";

export function PostCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<GhlPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const from = startOfMonth(currentMonth).toISOString();
      const to = endOfMonth(currentMonth).toISOString();
      try {
        const data = await apiFetch<{ posts: GhlPost[] }>(
          `/api/ghl/posts?type=scheduled&fromDate=${from}&toDate=${to}&limit=200`
        );
        setPosts(data.posts);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const postsForDate = (date: Date) =>
    posts.filter(
      (p) => p.displayDate && isSameDay(new Date(p.displayDate), date)
    );

  const selectedPosts = selectedDate ? postsForDate(selectedDate) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading calendar...
            </div>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {days.map((day) => {
                  const dayPosts = postsForDate(day);
                  const isSelected =
                    selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[80px] rounded-lg border p-2 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : isToday
                            ? "border-primary/30 bg-primary/5"
                            : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isToday ? "text-primary" : "text-slate-700"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {dayPosts.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayPosts.slice(0, 2).map((p) => (
                            <div
                              key={p._id}
                              className="truncate rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-800"
                            >
                              {p.summary?.slice(0, 20) ?? "Post"}
                            </div>
                          ))}
                          {dayPosts.length > 2 && (
                            <p className="text-[10px] text-muted">
                              +{dayPosts.length - 2} more
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          {selectedDate
            ? format(selectedDate, "EEEE, MMM d")
            : "Select a date"}
        </h3>
        {selectedDate ? (
          selectedPosts.length > 0 ? (
            <div className="space-y-3">
              {selectedPosts.map((post) => (
                <div
                  key={post._id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <PlatformBadge platform={post.platform} />
                    <StatusBadge status={String(post.status)} />
                  </div>
                  <p className="text-sm text-slate-700">
                    {post.summary || "No caption"}
                  </p>
                  {post.displayDate && (
                    <p className="mt-1 text-xs text-muted">
                      {format(new Date(post.displayDate), "h:mm a")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No posts scheduled for this day.</p>
          )
        ) : (
          <p className="text-sm text-muted">
            Click a date on the calendar to view scheduled posts.
          </p>
        )}
        <Link
          href="/compose"
          className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-hover"
        >
          + Schedule a new post
        </Link>
      </div>
    </div>
  );
}
