import { NextRequest, NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/api-client";
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "juli_token";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function GET(req: NextRequest) {
  const token = await getToken();
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const res = await callEdgeFunction("notifications-list", {
    method: "GET",
    token,
    params: searchParams,
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = await getToken();
  const res = await callEdgeFunction("notifications-list", {
    method: "POST",
    body,
    token,
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
