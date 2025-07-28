import { NextResponse } from "next/server";

const GITHUB_CONTENTS_API =
  "https://api.github.com/repos/terrafirma2021/MAKCM_v2_files/contents";

async function fetchLastModified(url: string, headers: HeadersInit) {
  try {
    const res = await fetch(url, { method: "HEAD", headers });
    if (res.ok) {
      return res.headers.get("last-modified") || "";
    }
  } catch {
    // ignore errors
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

    const exeFiles = files.filter(
      (f) => f.type === "file" && f.name.endsWith(".exe")
    );

    const fileDetails = await Promise.all(
      exeFiles.map(async (file) => {
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
  } catch (error) {
    console.error("Error listing makcu bin files:", error);
    return NextResponse.json(
      { error: "Failed to list resource files" },
      { status: 500 }
    );
  }
}
