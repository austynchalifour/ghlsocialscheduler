import { PostCalendar } from "@/components/PostCalendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="mt-1 text-sm text-muted">
          Visual overview of your scheduled posts.
        </p>
      </div>
      <PostCalendar />
    </div>
  );
}
