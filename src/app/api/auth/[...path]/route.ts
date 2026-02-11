import { NextRequest, NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/api-client";
import { cookies } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { loginSchema, registerSchema, verifyOtpSchema, resetPasswordSchema, validateBody } from "@/lib/validations";

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "juli_token";

// Rate limit configs per action
const RATE_LIMITS: Record<string, { max: number; windowSec: number }> = {
  login: { max: 10, windowSec: 900 },        // 10 attempts per 15min
  register: { max: 5, windowSec: 3600 },     // 5 per hour
  "reset-password": { max: 5, windowSec: 3600 }, // 5 per hour
  "resend-otp": { max: 5, windowSec: 600 },  // 5 per 10min
  "verify-otp": { max: 10, windowSec: 600 }, // 10 per 10min
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const slug = path.join("-");
  const functionName = `auth-${slug}`;

  // Rate limiting for sensitive endpoints
  const limitConfig = RATE_LIMITS[slug];
  if (limitConfig) {
    const ip = getClientIp(req);
    const rl = rateLimit(`auth:${slug}:${ip}`, limitConfig);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  const body = await req.json();

  // Input validation for sensitive endpoints
  const validationSchemas: Record<string, Parameters<typeof validateBody>[1]> = {
    login: loginSchema,
    register: registerSchema,
    "verify-otp": verifyOtpSchema,
    "reset-password": resetPasswordSchema,
  };

  const schema = validationSchemas[slug];
  if (schema) {
    const validation = validateBody(body, schema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const res = await callEdgeFunction(functionName, { method: "POST", body, token });
  const data = await res.json();

  // For login/register, set the JWT as an httpOnly cookie
  if ((slug === "login" || slug === "register") && res.ok && data.token) {
    const response = NextResponse.json(data, { status: res.status });
    response.cookies.set(COOKIE_NAME, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return response;
  }

  // For logout, clear the cookie
  if (slug === "logout") {
    const response = NextResponse.json({ success: true });
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const slug = path.join("-");
  const functionName = `auth-${slug}`;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const searchParams = Object.fromEntries(req.nextUrl.searchParams);

  const res = await callEdgeFunction(functionName, { method: "GET", token, params: searchParams });
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
