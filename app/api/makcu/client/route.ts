import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const RESOURCE_DIR = path.join(process.cwd(), "resource");

export async function GET() {
  try {
    if (!fs.existsSync(RESOURCE_DIR)) {
      return NextResponse.json(
        { error: "Resource directory not found" },
        { status: 404 }
      );
    }
    const files = await readdir(RESOURCE_DIR);

    const makcuFiles = files.filter((file) => file.endsWith(".exe"));

    const fileDetails = await Promise.all(
      makcuFiles.map(async (fileName) => {
        const filePath = path.join(RESOURCE_DIR, fileName);
        const fileStat = await stat(filePath);

        return {
          name: fileName,
          path: `/resource/${fileName}`,
          size: fileStat.size,
          lastModified: fileStat.mtime,
          downloadUrl: `/api/download/${fileName}`,
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
