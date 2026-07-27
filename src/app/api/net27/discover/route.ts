import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "movie";
  const sort = searchParams.get("sort") || "trending";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";

  const params: {
    type?: string;
    sort?: string;
    genre?: string;
    year_from?: string;
    year_to?: string;
    region?: string;
  } = {
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
    const items = await getProvider().fetchDiscover(params);
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, items: [] });
  }
}
