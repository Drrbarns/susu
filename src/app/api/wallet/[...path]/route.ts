import { NextRequest, NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/api-client";
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "juli_token";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const functionName = `wallet-${path.join("-")}`;
  const body = await req.json();
  const token = await getToken();
  const res = await callEdgeFunction(functionName, { method: "POST", body, token });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const functionName = `wallet-${path.join("-")}`;
  const token = await getToken();
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const res = await callEdgeFunction(functionName, { method: "GET", token, params: searchParams });
  return NextResponse.json(await res.json(), { status: res.status });
}
