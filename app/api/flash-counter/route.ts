import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const COUNTER_FILE = path.join(process.cwd(), "data", "flash-counter.json");
const INITIAL_COUNT = 8010;

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(COUNTER_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read counter from file
function readCounter(): number {
  try {
    ensureDataDirectory();
    if (fs.existsSync(COUNTER_FILE)) {
      const data = fs.readFileSync(COUNTER_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return parsed.count || INITIAL_COUNT;
    }
  } catch (error) {
    console.error("Error reading flash counter:", error);
  }
  return INITIAL_COUNT;
}

// Write counter to file
function writeCounter(count: number): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count, updatedAt: new Date().toISOString() }), "utf-8");
  } catch (error) {
    console.error("Error writing flash counter:", error);
  }
}

// GET - Retrieve current counter
export async function GET() {
  try {
    const count = readCounter();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error getting flash counter:", error);
    return NextResponse.json(
      { error: "Failed to retrieve flash counter" },
      { status: 500 }
    );
  }
}

// POST - Increment counter
export async function POST() {
  try {
    const currentCount = readCounter();
    const newCount = currentCount + 1;
    writeCounter(newCount);
    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error("Error incrementing flash counter:", error);
    return NextResponse.json(
      { error: "Failed to increment flash counter" },
      { status: 500 }
    );
  }
}
