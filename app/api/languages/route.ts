import { NextResponse } from "next/server";
import { getAllLanguageConfigs } from "@/lib/locale";

export async function GET() {
  try {
    const languages = getAllLanguageConfigs();
    return NextResponse.json(languages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}

