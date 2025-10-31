import { NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const COUNTER_FILE = path.join(process.cwd(), "data", "flash-counter.json");
const INITIAL_COUNT = 8010;

// Security: Secret key for API authentication
// This should be set as an environment variable in production
const API_SECRET = process.env.FLASH_COUNTER_SECRET || crypto.randomBytes(32).toString("hex");

// Rate limiting: Store recent requests by IP
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 increments per minute per IP

// Token management: Store valid tokens
interface FlashToken {
  token: string;
  createdAt: number;
  used: boolean;
  ip: string;
}
const tokenStore = new Map<string, FlashToken>();
const TOKEN_VALIDITY = 300000; // 5 minutes

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

// Security: Validate request origin
function validateOrigin(headersList: Headers): boolean {
  const origin = headersList.get("origin");
  const referer = headersList.get("referer");
  const host = headersList.get("host");

  // Allow requests from same origin
  if (origin && host) {
    const originHost = new URL(origin).host;
    if (originHost === host) {
      return true;
    }
  }

  // Check referer as fallback
  if (referer && host) {
    const refererHost = new URL(referer).host;
    if (refererHost === host) {
      return true;
    }
  }

  return false;
}

// Security: Rate limiting by IP
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitStore.get(ip) || [];

  // Filter out requests outside the time window
  const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  // Add current request and update store
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);

  // Clean up old entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }

  return true;
}

// Security: Get client IP address
function getClientIP(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

// Token management: Generate a secure token
function generateToken(ip: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenData: FlashToken = {
    token,
    createdAt: Date.now(),
    used: false,
    ip,
  };
  tokenStore.set(token, tokenData);

  // Clean up expired tokens
  cleanupExpiredTokens();

  return token;
}

// Token management: Validate and consume a token
function validateAndConsumeToken(token: string, ip: string): boolean {
  const tokenData = tokenStore.get(token);

  if (!tokenData) {
    return false; // Token not found
  }

  // Check if token is expired
  if (Date.now() - tokenData.createdAt > TOKEN_VALIDITY) {
    tokenStore.delete(token);
    return false;
  }

  // Check if token was already used
  if (tokenData.used) {
    return false;
  }

  // Check if IP matches (prevent token theft)
  if (tokenData.ip !== ip) {
    console.warn(`Token IP mismatch: expected ${tokenData.ip}, got ${ip}`);
    return false;
  }

  // Mark token as used
  tokenData.used = true;
  tokenStore.set(token, tokenData);

  // Delete the token after a short delay to prevent immediate reuse
  setTimeout(() => tokenStore.delete(token), 5000);

  return true;
}

// Token management: Clean up expired tokens
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now - data.createdAt > TOKEN_VALIDITY || data.used) {
      tokenStore.delete(token);
    }
  }
}

// GET - Retrieve current counter or generate token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // If requesting a token
    if (action === "token") {
      const headersList = await headers();

      // Validate origin for token requests too
      if (!validateOrigin(headersList)) {
        return NextResponse.json(
          { error: "Forbidden - Invalid origin" },
          { status: 403 }
        );
      }

      const clientIP = getClientIP(headersList);
      const token = generateToken(clientIP);

      return NextResponse.json({ token });
    }

    // Default: return counter
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

// POST - Increment counter (PROTECTED with token-based authentication)
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const body = await request.json();
    const { token } = body;

    // Security Check 1: Validate request origin
    if (!validateOrigin(headersList)) {
      console.warn("Unauthorized flash counter increment attempt - invalid origin");
      return NextResponse.json(
        { error: "Forbidden - Invalid origin" },
        { status: 403 }
      );
    }

    // Security Check 2: Validate token
    const clientIP = getClientIP(headersList);
    if (!token || !validateAndConsumeToken(token, clientIP)) {
      console.warn("Unauthorized flash counter increment attempt - invalid or expired token");
      return NextResponse.json(
        { error: "Unauthorized - Invalid or expired token" },
        { status: 401 }
      );
    }

    // Security Check 3: Rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // All security checks passed - increment counter
    const currentCount = readCounter();
    const newCount = currentCount + 1;
    writeCounter(newCount);

    console.log(`Flash counter incremented to ${newCount} by IP: ${clientIP}`);

    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error("Error incrementing flash counter:", error);
    return NextResponse.json(
      { error: "Failed to increment flash counter" },
      { status: 500 }
    );
  }
}
