import { NextRequest, NextResponse } from "next/server";
import { searchNetMirror, getEmbedUrl } from "@/lib/netmirror";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  try {
    const results = await searchNetMirror(query);
    const movie = results[0];
    if (!movie) {
      return NextResponse.json({ error: "Not found", sources: [] });
    }

    const embedUrl = await getEmbedUrl(movie.tmdbId, movie.type);

    return NextResponse.json({
      title: movie.title,
      sources: [
        {
          provider: "screenscape",
          providerUrl: "",
          label: "Screenscape",
          embedUrl,
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
