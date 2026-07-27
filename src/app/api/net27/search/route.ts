import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ ok: false, error: "Missing q param" }, { status: 400 });
  try {
    const items = await getProvider().search(q);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
