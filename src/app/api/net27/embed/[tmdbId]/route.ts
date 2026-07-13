import { NextRequest, NextResponse } from "next/server";
import { fetchEmbedSource, resolveStreamUrl, resolveAllSources } from "@/lib/net27";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  const { tmdbId } = await params;
  const type = req.nextUrl.searchParams.get("type") || "movie";
  const se = parseInt(req.nextUrl.searchParams.get("se") || "1");
  const ep = parseInt(req.nextUrl.searchParams.get("ep") || "1");
  const dub = req.nextUrl.searchParams.get("dub") || undefined;
  const quality = req.nextUrl.searchParams.get("quality");

  try {
    const resp = await fetchEmbedSource(Number(tmdbId), type, se, ep, dub);
    if (!resp) return NextResponse.json({ ok: false, error: "No embed found" }, { status: 404 });

    const sources = resolveAllSources(resp);
    const stream = resolveStreamUrl(resp, quality ? Number(quality) : undefined);

    return NextResponse.json({
      ok: true,
      embed: resp,
      stream,
      sources,
      captions: resp.captions || [],
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
