export type Platform =
  | "google"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "twitter"
  | "tiktok"
  | "pinterest"
  | "youtube"
  | "bluesky"
  | "community";

export type PostType = "post" | "story" | "reel";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "failed"
  | "in_progress"
  | "in_review"
  | "pending"
  | "deleted";

export type PostFilterType =
  | "all"
  | "scheduled"
  | "draft"
  | "published"
  | "failed"
  | "recent";

export interface GhlAccount {
  id: string;
  oauthId?: string;
  profileId?: string;
  name: string;
  platform: Platform;
  type?: string;
  expire?: string;
  isExpired?: boolean;
  meta?: Record<string, unknown>;
}

export interface GhlAccountGroup {
  id: string;
  name: string;
  accountIds: string[];
}

export interface GhlMedia {
  url: string;
  caption?: string;
  type?: string;
  thumbnail?: string;
}

export interface GhlPost {
  _id: string;
  source?: string;
  locationId: string;
  platform?: Platform;
  displayDate?: string;
  createdAt?: string;
  updatedAt?: string;
  accountId?: string;
  accountIds?: string[];
  summary?: string;
  media?: GhlMedia[];
  status?: PostStatus | string;
  type?: PostType | string;
  publishedAt?: string;
  error?: string;
  tags?: string[];
}

export interface CreatePostPayload {
  accountIds: string[];
  type: PostType;
  summary: string;
  status: "draft" | "scheduled" | "published";
  scheduleDate?: string;
  media?: GhlMedia[];
  followUpComment?: string;
  tags?: string[];
  categoryId?: string;
  userId?: string;
}

export interface ListPostsPayload {
  type?: PostFilterType;
  accounts?: string;
  skip?: string;
  limit?: string;
  fromDate: string;
  toDate: string;
  includeUsers?: string;
  postType?: PostType;
}

export interface GhlCredentials {
  token: string;
  locationId: string;
}

export interface GhlApiResponse<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  results?: T;
}

export const PLATFORM_LABELS: Record<string, string> = {
  google: "Google Business",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  youtube: "YouTube",
  bluesky: "Bluesky",
  community: "Community",
};

export const PLATFORM_COLORS: Record<string, string> = {
  google: "bg-red-500",
  facebook: "bg-blue-600",
  instagram: "bg-pink-600",
  linkedin: "bg-blue-700",
  twitter: "bg-sky-500",
  tiktok: "bg-neutral-900",
  pinterest: "bg-red-700",
  youtube: "bg-red-600",
  bluesky: "bg-sky-400",
  community: "bg-violet-600",
};

export const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-800 border-amber-200",
  published: "bg-emerald-100 text-emerald-800 border-emerald-200",
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  in_review: "bg-purple-100 text-purple-800 border-purple-200",
};
