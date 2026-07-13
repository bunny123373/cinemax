import { NextRequest, NextResponse } from "next/server";
import { fetchVariants } from "@/lib/net27";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; tmdbId: string }> }
) {
  const { type, tmdbId } = await params;
  const se = parseInt(req.nextUrl.searchParams.get("se") || "1");
  const ep = parseInt(req.nextUrl.searchParams.get("ep") || "1");

  try {
    const resp = await fetchVariants(type, Number(tmdbId), se, ep);
    if (!resp) return NextResponse.json({ ok: false, error: "No variants found" }, { status: 404 });
    return NextResponse.json(resp);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
