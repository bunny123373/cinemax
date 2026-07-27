import { NextRequest, NextResponse } from "next/server";
import { getProvider, listProviders } from "@/lib/plugins/registry";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "netflix";
  const action = searchParams.get("action") || "trending";

  if (action === "list") {
    return NextResponse.json({ ok: true, providers: listProviders() });
  }

  try {
    const provider = getProvider(id);

    if (action === "trending") {
      const items = await provider.fetchTrending();
      return NextResponse.json({ ok: true, items });
    }

    if (action === "home") {
      const data = await provider.fetchHomeCategories();
      return NextResponse.json({ ok: true, ...data });
    }

    if (action === "discover") {
      const type = searchParams.get("type") || "movie";
      const genre = searchParams.get("genre") || "";
      const items = await provider.fetchDiscover({ type, genre });
      return NextResponse.json({ ok: true, items });
    }

    if (action === "search") {
      const q = searchParams.get("q") || "";
      const items = await provider.search(q);
      return NextResponse.json({ ok: true, items });
    }

    if (action === "detail") {
      const tmdbId = searchParams.get("tmdbId") || "";
      const dp = searchParams.get("dp") || undefined;
      const type = searchParams.get("type") || "movie";
      const detail = await provider.fetchTitleDetail(type, tmdbId, dp);
      return NextResponse.json({ ok: true, detail });
    }

    if (action === "embed") {
      const tmdbId = searchParams.get("tmdbId") || "";
      const type = searchParams.get("type") || "movie";
      const se = parseInt(searchParams.get("se") || "1");
      const ep = parseInt(searchParams.get("ep") || "1");
      const dub = searchParams.get("dub") || undefined;
      const dp = searchParams.get("dp") || undefined;
      const quality = searchParams.get("quality");

      const resp = await provider.fetchEmbedSource(tmdbId, type, se, ep, dub, dp);
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
    }

    if (action === "episodes") {
      const tmdbId = searchParams.get("tmdbId") || "";
      const type = searchParams.get("type") || "tv";
      const season = parseInt(searchParams.get("season") || "1");
      const episodes = await provider.fetchEpisodes(type, tmdbId, season);
      return NextResponse.json({ ok: true, episodes });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
