import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    if (filename.includes("..")) {
        return new NextResponse("access denied", { status: 403 });
    }

    try {
        const filePath = path.join(process.cwd(), "resource", filename);
        const fileBuffer = await fs.readFile(filePath);

        const extension = path.extname(filename).toLowerCase();
        let contentType = "application/octet-stream";

        if (extension === ".pdf") contentType = "application/pdf";
        else if (extension === ".jpg" || extension === ".jpeg")
            contentType = "image/jpeg";
        else if (extension === ".png") contentType = "image/png";
        else if (extension === ".txt") contentType = "text/plain";
        else if (extension === ".html") contentType = "text/html";
        else if (extension === ".json") contentType = "application/json";

        const headers = new Headers({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(
                filename
            )}"`,
        });

        return new NextResponse(fileBuffer, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error(` File download error:$ {error}`);
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return new NextResponse("File does not exist ", { status: 404 });
        }
        return new NextResponse("Server Error ", { status: 500 });
    }
}
