/**
 * GitHub OAuth integration via Clerk.
 * Clerk manages the GitHub OAuth flow and stores the access token.
 * We retrieve it server-side to make GitHub API calls.
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { GitHubScanner } from "./github-scanner";

/**
 * Get the GitHub access token for the current user from Clerk's OAuth provider.
 */
export async function getGitHubToken(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const client = await clerkClient();
    const response = await client.users.getUserOauthAccessToken(userId, "github");

    // The response is a paginated list of tokens
    const tokens = response.data;
    if (tokens && tokens.length > 0) {
      return tokens[0].token;
    }
    return null;
  } catch (error) {
    console.error("Failed to get GitHub token:", error);
    return null;
  }
}

/**
 * Get a GitHubScanner instance for the current user.
 */
export async function getScanner(): Promise<GitHubScanner | null> {
  const token = await getGitHubToken();
  if (!token) return null;
  return new GitHubScanner(token);
}
