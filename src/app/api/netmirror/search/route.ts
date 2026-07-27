import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  if (!query) {
    return NextResponse.json({ success: false, error: "Missing query param 'q'" }, { status: 400 });
  }

  try {
    const results = await getProvider().search(query);
    return NextResponse.json({
      success: true,
      data: { query, results, timestamp: new Date().toISOString() },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Search failed" }, { status: 500 });
  }
}
