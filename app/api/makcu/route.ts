import { NextResponse } from "next/server";

const GITHUB_CONTENTS_API =
  "https://api.github.com/repos/terrafirma2021/MAKCM_v2_files/contents";

// Simple in-memory cache to avoid repeated HEAD requests which can quickly
// exhaust GitHub's rate limits. Entries expire after a short TTL so updates
// are eventually reflected.
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes
const lastModifiedCache = new Map<
  string,
  { lastModified: string; fetchedAt: number }
>();

interface RateLimitError extends Error {
  rateLimited?: boolean;
}

async function fetchLastModified(url: string, headers: HeadersInit) {
  const cached = lastModifiedCache.get(url);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.lastModified;
  }

  try {
    const res = await fetch(url, { method: "HEAD", headers });
    if (res.status === 403) {
      throw Object.assign(new Error("Rate limit exceeded"), {
        rateLimited: true,
      });
    }

    if (res.ok) {
      const lastModified = res.headers.get("last-modified") || "";
      lastModifiedCache.set(url, { lastModified, fetchedAt: Date.now() });
      return lastModified;
    }
  } catch (error) {
    if ((error as RateLimitError)?.rateLimited) {
      throw error;
    }
    // ignore errors and fallback to empty string
  }

  return "";
}

export async function GET() {
  try {
    const headers: HeadersInit = {};
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(GITHUB_CONTENTS_API, { headers });
    if (res.status === 403) {
      return NextResponse.json(
        { error: "GitHub rate limit exceeded", rateLimited: true },
        { status: 403 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch repository contents" },
        { status: res.status }
      );
    }

    const files = (await res.json()) as Array<{
      name: string;
      path: string;
      size: number;
      download_url: string | null;
      type: string;
    }>;

    const binFiles = files.filter(
      (f) => f.type === "file" && f.name.endsWith(".bin")
    );

    const fileDetails = await Promise.all(
      binFiles.map(async (file) => {
        const lastModified = file.download_url
          ? await fetchLastModified(file.download_url, headers)
          : "";
        return {
          name: file.name,
          path: file.path,
          size: file.size,
          lastModified,
          downloadUrl: file.download_url,
        };
      })
    );

    return NextResponse.json(fileDetails);
  } catch (error: unknown) {
    console.error("Error listing makcu bin files:", error);

    if ((error as RateLimitError)?.rateLimited) {
      return NextResponse.json(
        { error: "GitHub rate limit exceeded", rateLimited: true },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to list resource files" },
      { status: 500 }
    );
  }
}
