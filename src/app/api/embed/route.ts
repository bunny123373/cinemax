import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  try {
    const results = await getProvider().search(query);
    const movie = results[0];
    if (!movie) {
      return NextResponse.json({ error: "Not found", sources: [] });
    }

    return NextResponse.json({
      title: movie.title,
      sources: [
        {
          provider: "netflix",
          providerUrl: "",
          label: "Netflix",
          tmdbId: movie.tmdbId,
          type: movie.type,
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
