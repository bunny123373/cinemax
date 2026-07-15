import { NextRequest, NextResponse } from "next/server";

const NET27_BASE = "https://net27.cc";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "movie";
  const sort = searchParams.get("sort") || "trending";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";

  const params: Record<string, string> = {
    type,
    sort,
    region: "IN",
  };
  if (genre) params.genre = genre;

  if (year) {
    if (year.includes("-")) {
      const [from, to] = year.split("-");
      params.year_from = from;
      params.year_to = to;
    } else if (year === "Before 1990") {
      params.year_from = "1900";
      params.year_to = "1989";
    } else {
      params.year_from = year;
      params.year_to = year;
    }
  }

  try {
    const url = new URL(`${NET27_BASE}/api/catalog/discover`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return NextResponse.json({ ok: false, items: [] });
    const data = await res.json();
    return NextResponse.json({ ok: true, items: data.items || [] });
  } catch {
    return NextResponse.json({ ok: false, items: [] });
  }
}
