import { getGhlCredentialsForUser } from "@/lib/auth";
import { getSession } from "@/lib/session";
import type { GhlCredentials } from "./types";

export const GHL_API_BASE = "https://services.leadconnectorhq.com";
export const GHL_API_VERSION = "2021-07-28";

export type CredentialError = {
  error: string;
  code: "UNAUTHORIZED" | "NO_GHL_CONNECTION";
};

export async function resolveUserCredentials(): Promise<
  GhlCredentials | CredentialError
> {
  const session = await getSession();
  if (!session) {
    return {
      error: "You must be signed in.",
      code: "UNAUTHORIZED",
    };
  }

  const creds = await getGhlCredentialsForUser(session.userId);
  if (!creds) {
    return {
      error: "Connect your GoHighLevel location in Settings.",
      code: "NO_GHL_CONNECTION",
    };
  }

  return creds;
}

export async function resolveCredentialsFromValues(
  locationId: string,
  apiToken: string
): Promise<GhlCredentials> {
  return {
    locationId: locationId.trim(),
    token: apiToken.trim(),
  };
}
