import { GHL_API_BASE, GHL_API_VERSION } from "./config";
import type {
  CreatePostPayload,
  GhlAccount,
  GhlAccountGroup,
  GhlApiResponse,
  GhlCredentials,
  GhlPost,
  ListPostsPayload,
} from "./types";

export class GhlApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "GhlApiError";
  }
}

async function ghlRequest<T>(
  credentials: GhlCredentials,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${GHL_API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${credentials.token}`,
      Version: GHL_API_VERSION,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      (data as { message?: string | string[] })?.message ??
      `GHL API error (${response.status})`;
    throw new GhlApiError(
      Array.isArray(message) ? message.join(", ") : String(message),
      response.status,
      data
    );
  }

  return data as T;
}

export async function getAccounts(credentials: GhlCredentials) {
  const data = await ghlRequest<
    GhlApiResponse<{ accounts: GhlAccount[]; groups: GhlAccountGroup[] }>
  >(credentials, `/social-media-posting/${credentials.locationId}/accounts`);

  return {
    accounts: data.results?.accounts ?? [],
    groups: data.results?.groups ?? [],
  };
}

export async function listPosts(
  credentials: GhlCredentials,
  payload: ListPostsPayload
) {
  const data = await ghlRequest<GhlApiResponse<{ posts: GhlPost[] }>>(
    credentials,
    `/social-media-posting/${credentials.locationId}/posts/list`,
    {
      method: "POST",
      body: JSON.stringify({
        type: payload.type ?? "all",
        skip: payload.skip ?? "0",
        limit: payload.limit ?? "50",
        fromDate: payload.fromDate,
        toDate: payload.toDate,
        includeUsers: payload.includeUsers ?? "true",
        ...(payload.accounts ? { accounts: payload.accounts } : {}),
        ...(payload.postType ? { postType: payload.postType } : {}),
      }),
    }
  );

  return data.results?.posts ?? [];
}

export async function getPost(credentials: GhlCredentials, postId: string) {
  const data = await ghlRequest<GhlApiResponse<{ post: GhlPost }>>(
    credentials,
    `/social-media-posting/${credentials.locationId}/posts/${postId}`
  );
  return data.results?.post;
}

export async function createPost(
  credentials: GhlCredentials,
  payload: CreatePostPayload
) {
  const body: Record<string, unknown> = {
    accountIds: payload.accountIds,
    type: payload.type,
    summary: payload.summary,
    status: payload.status,
  };

  if (payload.scheduleDate) body.scheduleDate = payload.scheduleDate;
  if (payload.media?.length) body.media = payload.media;
  if (payload.followUpComment) body.followUpComment = payload.followUpComment;
  if (payload.tags?.length) body.tags = payload.tags;
  if (payload.categoryId) body.categoryId = payload.categoryId;
  if (payload.userId) body.userId = payload.userId;

  const data = await ghlRequest<GhlApiResponse<{ post: GhlPost }>>(
    credentials,
    `/social-media-posting/${credentials.locationId}/posts`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  return data.results?.post;
}

export async function updatePost(
  credentials: GhlCredentials,
  postId: string,
  payload: Partial<CreatePostPayload>
) {
  const data = await ghlRequest<GhlApiResponse<{ post: GhlPost }>>(
    credentials,
    `/social-media-posting/${credentials.locationId}/posts/${postId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );

  return data.results?.post;
}

export async function deletePost(credentials: GhlCredentials, postId: string) {
  await ghlRequest(
    credentials,
    `/social-media-posting/${credentials.locationId}/posts/${postId}`,
    { method: "DELETE" }
  );
}

export async function testConnection(credentials: GhlCredentials) {
  const { accounts } = await getAccounts(credentials);
  return { connected: true, accountCount: accounts.length };
}
