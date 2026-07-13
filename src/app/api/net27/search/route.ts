import { NextRequest, NextResponse } from "next/server";
import { searchNet27 } from "@/lib/net27";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ ok: false, error: "Missing q param" }, { status: 400 });
  try {
    const items = await searchNet27(q);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
