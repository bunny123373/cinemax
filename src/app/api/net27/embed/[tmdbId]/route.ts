import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

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
  const detailPath = req.nextUrl.searchParams.get("dp") || undefined;

  try {
    const provider = getProvider();
    const resp = await provider.fetchEmbedSource(tmdbId, type, se, ep, dub, detailPath);
    if (!resp) return NextResponse.json({ ok: false, error: "No embed found" }, { status: 404 });

    const sources = provider.resolveAllSources(resp);
    const stream = provider.resolveStreamUrl(resp, quality ? Number(quality) : undefined);

    return NextResponse.json({
      ok: true,
      embed: resp,
      stream,
      sources,
      captions: resp.captions || [],
      spaPlayerUrl: (resp as any).spaPlayerUrl || null,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
