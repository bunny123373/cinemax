import { NextRequest, NextResponse } from "next/server";
import { scrapeNetMirror, scrapeNetMirrorSearch, scrapeNetMirrorEmbed } from "@/lib/netmirror-scraper";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "search";
  const query = req.nextUrl.searchParams.get("q") || "";
  const url = req.nextUrl.searchParams.get("url") || "";
  const tmdbId = req.nextUrl.searchParams.get("tmdbId") || "";

  if (type === "search") {
    if (!query) {
      return NextResponse.json({ ok: false, error: "Missing query param 'q'" }, { status: 400 });
    }
    const results = await scrapeNetMirrorSearch(query);
    return NextResponse.json({ ok: true, provider: "netflix", results });
  }

  if (type === "scrape") {
    if (!url) {
      return NextResponse.json({ ok: false, error: "Missing query param 'url'" }, { status: 400 });
    }
    const result = await scrapeNetMirror(url);
    return NextResponse.json({ ok: true, provider: "netflix", result });
  }

  if (type === "embed") {
    if (!tmdbId) {
      return NextResponse.json({ ok: false, error: "Missing query param 'tmdbId'" }, { status: 400 });
    }
    const embedType = req.nextUrl.searchParams.get("mediaType") || "movie";
    const content = await scrapeNetMirrorEmbed(Number(tmdbId), embedType);
    return NextResponse.json({ ok: true, provider: "netflix", content });
  }

  return NextResponse.json({ ok: false, error: "Invalid type. Use: search, scrape, or embed" }, { status: 400 });
}
