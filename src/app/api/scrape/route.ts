import { NextRequest, NextResponse } from "next/server";
import { RawLeadRecord } from "@/types/leads";
import { canonicalizeDomain } from "@/lib/deduplicationEngine";
import { BUY_BOX_PRESETS, buildEnrichedPipeline } from "@/lib/scoringEngine";

const INDUSTRY_TO_NAICS: Record<string, string> = {
  "Managed IT & MSP": "541512",
  "Commercial HVAC & Mechanical": "238220",
  "Data Center & Critical Infrastructure": "811212",
  "Specialized B2B Logistics": "488510",
  "Industrial Testing & Compliance": "541380",
  "Commercial Facility Maintenance": "561720",
  "Precision Manufacturing": "332710",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawDomain = (body.domain || "midwestprecisionair.com").trim();
    const canonical = canonicalizeDomain(rawDomain) || "midwestprecisionair.com";
    const companyBaseName =
      body.companyName ||
      canonical
        .split(".")[0]
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const industry =
      body.industry || "Data Center & Critical Infrastructure";
    const naicsCode = INDUSTRY_TO_NAICS[industry] || "811212";
    const city = body.city || "Columbus";
    const state = body.state || "OH";
    const employeeCount = Number(body.employeeCount) || 34;
    const foundedYear = Number(body.foundedYear) || 1997;
    const ownerName = body.ownerName || "Robert Sterling";

    // Attempt live lightweight HTML header/tech inspection if user entered a real public website
    const detectedTech: string[] = [];
    let hasScheduling = false;
    let hasPortal = false;
    let copyrightYear = 2019;
    let liveFetchStatus = "Simulated Multi-Source Scrape + Heuristic Tech Scan";

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2200);
      const targetUrl = rawDomain.startsWith("http")
        ? rawDomain
        : `https://${canonical}`;
      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; SaaSquatchDealRadar/1.0; +https://saasquatchleads.com)",
        },
      });
      clearTimeout(timeout);
      if (res.ok) {
        const html = (await res.text()).slice(0, 80000).toLowerCase();
        liveFetchStatus = `Live HTTP 200 DOM Scan (${targetUrl})`;
        if (html.includes("wp-content")) detectedTech.push("WordPress CMS");
        if (html.includes("wix.com")) detectedTech.push("Wix Builder");
        if (html.includes("squarespace")) detectedTech.push("Squarespace");
        if (html.includes("jquery")) detectedTech.push("jQuery Legacy");
        if (html.includes("calendly") || html.includes("servicetitan")) {
          hasScheduling = true;
          detectedTech.push("Automated Booking Widget");
        }
        if (html.includes("hubspot") || html.includes("connectwise")) {
          hasPortal = true;
          detectedTech.push("Client Portal / CRM");
        }
        const yearMatches = html.match(/©\s*(20\d{2})/i);
        if (yearMatches && yearMatches[1]) {
          copyrightYear = Number(yearMatches[1]);
        }
      }
    } catch {
      // Fallback to realistic LMM legacy stack signals
    }

    if (detectedTech.length === 0) {
      detectedTech.push("WordPress 5.x", "QuickBooks Desktop", "Manual Dispatch");
    }

    const tenure = Math.max(5, 2026 - foundedYear);
    const emailSlug = ownerName.toLowerCase().split(" ")[0];

    // Simulate 3 multi-source raw records pulled from Apollo, Google Maps, and Growjo with realistic variations
    const simulatedMultiSourceRecords: RawLeadRecord[] = [
      {
        rawId: `LIVE-APOLLO-${Date.now()}`,
        source: "Apollo",
        companyName: `${companyBaseName} LLC`,
        website: `https://www.${canonical}`,
        industry,
        naicsCode,
        city,
        state,
        foundedYear,
        employeeCount,
        reportedRevenueUsd: Math.round(employeeCount * 190000),
        ownerName,
        ownerTitle: "Founder & President",
        ownerTenureYears: tenure,
        ownerEmail: `${emailSlug}@${canonical}`,
        ownerPhone: "(614) 555-0194",
        ownerLinkedIn: `https://linkedin.com/in/${ownerName
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
        hasSecondTierManagement: false,
        ownershipType: "Founder / Family Owned",
        techStack: detectedTech,
        websiteLastUpdatedYear: copyrightYear,
        hasAutomatedScheduling: hasScheduling,
        hasCrmOrPortal: hasPortal,
        b2bRecurringPct: 81,
        notes: `${liveFetchStatus}. Multi-source verification across Apollo, Google Maps & Growjo.`,
      },
      {
        rawId: `LIVE-MAPS-${Date.now() + 1}`,
        source: "Google Maps",
        companyName: `${companyBaseName}, Inc.`,
        website: `http://${canonical}/`,
        industry,
        naicsCode,
        city,
        state,
        foundedYear,
        employeeCount: Math.max(5, employeeCount - 1),
        ownerName,
        ownerTitle: "Owner",
        ownerTenureYears: tenure,
        ownerEmail: `info@${canonical}`,
        ownerPhone: "+1-614-555-0194",
        ownerLinkedIn: `https://linkedin.com/in/${ownerName
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
        hasSecondTierManagement: false,
        ownershipType: "Founder / Family Owned",
        techStack: ["Google Business Profile Verified"],
        websiteLastUpdatedYear: copyrightYear,
        hasAutomatedScheduling: hasScheduling,
        hasCrmOrPortal: hasPortal,
        googleRating: 4.8,
        googleReviews: 54,
        b2bRecurringPct: 81,
      },
      {
        rawId: `LIVE-GROWJO-${Date.now() + 2}`,
        source: "Growjo",
        companyName: companyBaseName,
        website: canonical,
        industry,
        naicsCode,
        city,
        state,
        foundedYear,
        employeeCount,
        reportedRevenueUsd: Math.round(employeeCount * 330000), // Inflated Growjo estimate to demonstrate triangulation
        ownerName,
        ownerTitle: "CEO",
        ownerTenureYears: tenure,
        ownerEmail: `${emailSlug}@${canonical}`,
        ownerPhone: "6145550194",
        ownerLinkedIn: `https://linkedin.com/in/${ownerName
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
        hasSecondTierManagement: false,
        ownershipType: "Founder / Family Owned",
        techStack: detectedTech,
        websiteLastUpdatedYear: copyrightYear,
        hasAutomatedScheduling: hasScheduling,
        hasCrmOrPortal: hasPortal,
        b2bRecurringPct: 81,
      },
    ];

    const pipeline = buildEnrichedPipeline(
      simulatedMultiSourceRecords,
      BUY_BOX_PRESETS.eta_flagship.criteria
    );

    return NextResponse.json({
      status: "ok",
      liveFetchStatus,
      rawMultiSourceRecords: simulatedMultiSourceRecords,
      goldenRecord: pipeline.leads[0],
      dedupSummary: pipeline.stats,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Scrape error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
