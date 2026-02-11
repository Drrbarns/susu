import { NextRequest, NextResponse } from "next/server";
import { callEdgeFunction } from "@/lib/api-client";

/**
 * Moolre Payment Callback Route
 * This endpoint is called by Moolre after a payment is processed.
 * It forwards the callback to the payment-webhook Edge Function.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Moolre Callback] Received:", JSON.stringify(body));

    // Forward to payment-webhook edge function
    const res = await callEdgeFunction("payment-webhook", {
      method: "POST",
      body,
    });

    const data = await res.json();
    console.log("[Moolre Callback] Processed:", JSON.stringify(data));

    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    console.error("[Moolre Callback] Error:", error);
    return NextResponse.json(
      { received: true, error: "Internal processing error" },
      { status: 500 }
    );
  }
}

// Moolre may also send GET requests for verification
export async function GET() {
  return NextResponse.json({ status: "ok", service: "juli-smart-susu-payment-callback" });
}
