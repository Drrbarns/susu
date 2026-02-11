import { NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/api-client";

export async function GET() {
  try {
    const res = await callEdgeFunction("settings-public", { method: "GET" });
    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ config: {} }, { status: 500 });
  }
}
