import { NextRequest, NextResponse } from "next/server";
import { RAW_SCRAPED_LEADS } from "@/data/rawLeadsDataset";
import { BUY_BOX_PRESETS, buildEnrichedPipeline } from "@/lib/scoringEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const presetKey = searchParams.get("preset") || "eta_flagship";
  const preset = BUY_BOX_PRESETS[presetKey] || BUY_BOX_PRESETS.eta_flagship;

  const result = buildEnrichedPipeline(RAW_SCRAPED_LEADS, preset.criteria);

  return NextResponse.json({
    status: "ok",
    preset: preset.name,
    timestamp: new Date().toISOString(),
    ...result,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawLeads = Array.isArray(body.rawLeads)
      ? body.rawLeads
      : RAW_SCRAPED_LEADS;
    const criteria =
      body.criteria || BUY_BOX_PRESETS.eta_flagship.criteria;

    const result = buildEnrichedPipeline(rawLeads, criteria);
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
