import {
  BuyBoxCriteria,
  EnrichedLead,
  RawLeadRecord,
  RevenueTriangulation,
  SuccessionBreakdown,
} from "@/types/leads";
import { NAICS_BENCHMARKS } from "@/data/rawLeadsDataset";
import { deduplicateRawLeads, DeduplicatedGroup } from "./deduplicationEngine";

const CURRENT_YEAR = 2026;

export const BUY_BOX_PRESETS: Record<
  string,
  { name: string; description: string; criteria: BuyBoxCriteria }
> = {
  eta_flagship: {
    name: "Standard ETA Search Fund ($1M–$3M EBITDA)",
    description:
      "Classic search fund buy-box targeting retiring founders with $3M–$15M revenue, high recurring B2B contracts, and 15+ years operating history.",
    criteria: {
      presetId: "eta_flagship",
      minRevenue: 3000000,
      maxRevenue: 15000000,
      minEbitda: 750000,
      maxEbitda: 3500000,
      minEmployees: 15,
      maxEmployees: 85,
      minSuccessionScore: 65,
      selectedIndustries: [],
      excludeVcPeBacked: true,
      minRecurringPct: 65,
    },
  },
  self_funded_sba: {
    name: "Self-Funded Searcher / SBA 7(a) ($500k–$1.5M EBITDA)",
    description:
      "Lower-middle-market targets sized for SBA 7(a) debt ($2M–$7.5M revenue) with immediate owner-operator transition readiness.",
    criteria: {
      presetId: "self_funded_sba",
      minRevenue: 2000000,
      maxRevenue: 7500000,
      minEbitda: 500000,
      maxEbitda: 1600000,
      minEmployees: 10,
      maxEmployees: 45,
      minSuccessionScore: 70,
      selectedIndustries: [],
      excludeVcPeBacked: true,
      minRecurringPct: 60,
    },
  },
  caprae_ai_transformation: {
    name: "Caprae 7-Year AI Transformation Thesis",
    description:
      "High-moat B2B services & critical infrastructure with heavy legacy tech debt (paper/Excel workflows) primed for post-acquisition AI margin expansion.",
    criteria: {
      presetId: "caprae_ai_transformation",
      minRevenue: 2500000,
      maxRevenue: 16000000,
      minEbitda: 600000,
      maxEbitda: 3500000,
      minEmployees: 15,
      maxEmployees: 90,
      minSuccessionScore: 60,
      selectedIndustries: [],
      excludeVcPeBacked: true,
      minRecurringPct: 70,
    },
  },
  all_leads: {
    name: "Unfiltered Raw Scrape (Show All)",
    description:
      "View all scraped entities including VC-backed startups and PE rollups to compare against qualified targets.",
    criteria: {
      presetId: "all_leads",
      minRevenue: 0,
      maxRevenue: 100000000,
      minEbitda: 0,
      maxEbitda: 25000000,
      minEmployees: 1,
      maxEmployees: 500,
      minSuccessionScore: 0,
      selectedIndustries: [],
      excludeVcPeBacked: false,
      minRecurringPct: 0,
    },
  },
};

export function computeSuccessionBreakdown(
  lead: RawLeadRecord
): SuccessionBreakdown {
  const yearsInBusiness = Math.max(1, CURRENT_YEAR - lead.foundedYear);
  const rationale: string[] = [];

  // 1. Founder Tenure & Company Age (Max 35 pts)
  let tenureAndAgeScore = 0;
  if (lead.ownerTenureYears >= 25) {
    tenureAndAgeScore += 22;
    rationale.push(
      `Founder in seat ${lead.ownerTenureYears} yrs (Est. age ${
        32 + lead.ownerTenureYears
      } — prime Silver Tsunami retirement window)`
    );
  } else if (lead.ownerTenureYears >= 18) {
    tenureAndAgeScore += 17;
    rationale.push(
      `Long-tenured owner (${lead.ownerTenureYears} yrs) approaching transition horizon`
    );
  } else if (lead.ownerTenureYears >= 10) {
    tenureAndAgeScore += 10;
  } else {
    tenureAndAgeScore += 2;
    rationale.push(
      `Short executive tenure (${lead.ownerTenureYears} yrs) — low retirement probability`
    );
  }

  if (yearsInBusiness >= 25) {
    tenureAndAgeScore += 13;
  } else if (yearsInBusiness >= 15) {
    tenureAndAgeScore += 10;
  } else if (yearsInBusiness >= 8) {
    tenureAndAgeScore += 5;
  }

  // 2. Succession Vacuum Signal (Max 25 pts)
  let successionVacuumScore = 0;
  if (!lead.hasSecondTierManagement) {
    successionVacuumScore = 25;
    rationale.push(
      "No VP/COO/Heir apparent detected on LinkedIn — high succession vacuum"
    );
  } else {
    successionVacuumScore = 12;
    rationale.push(
      "Middle-management layer present — eases post-close transition risk"
    );
  }

  // 3. Digital & Tech Debt Modernization Gap (Max 20 pts)
  let digitalModernizationGapScore = 0;
  const webStagnationYears = CURRENT_YEAR - lead.websiteLastUpdatedYear;
  if (webStagnationYears >= 6) {
    digitalModernizationGapScore += 10;
    rationale.push(
      `Digital footprint untouched since ${lead.websiteLastUpdatedYear} — classic legacy operator signal`
    );
  } else if (webStagnationYears >= 4) {
    digitalModernizationGapScore += 7;
  } else {
    digitalModernizationGapScore += 2;
  }

  if (!lead.hasAutomatedScheduling) digitalModernizationGapScore += 5;
  if (!lead.hasCrmOrPortal) digitalModernizationGapScore += 5;

  // 4. Ownership Independence (Max 20 pts)
  let ownershipIndependenceScore = 0;
  if (lead.ownershipType === "Founder / Family Owned") {
    ownershipIndependenceScore = 20;
    rationale.push("100% Founder/Family owned — direct off-market bilateral deal");
  } else if (lead.ownershipType === "Bootstrapped Partnership") {
    ownershipIndependenceScore = 15;
  } else {
    ownershipIndependenceScore = 0;
    rationale.push(
      "Institutional VC/PE ownership — disqualified from proprietary succession outreach"
    );
  }

  return {
    tenureAndAgeScore: Math.min(35, tenureAndAgeScore),
    successionVacuumScore: Math.min(25, successionVacuumScore),
    digitalModernizationGapScore: Math.min(20, digitalModernizationGapScore),
    ownershipIndependenceScore: Math.min(20, ownershipIndependenceScore),
    rationale,
  };
}

export function triangulateFinancials(
  lead: RawLeadRecord
): RevenueTriangulation {
  const benchmark = NAICS_BENCHMARKS[lead.naicsCode] || {
    title: "General B2B Commercial Services",
    revPerEmployeeUsd: 160000,
    medianEbitdaMarginPct: 18,
    typicalMultipleLow: 3.5,
    typicalMultipleHigh: 4.8,
  };

  const naicsModeledRev = lead.employeeCount * benchmark.revPerEmployeeUsd;
  let triangulatedRevenue = naicsModeledRev;
  let confidenceScore = 84;
  let varianceWarning: string | undefined = undefined;

  if (lead.reportedRevenueUsd) {
    const ratio = lead.reportedRevenueUsd / naicsModeledRev;
    if (ratio > 1.55 || ratio < 0.45) {
      // Scraper hallucination detected (e.g. Growjo reporting $19.5M for 38 employees)
      triangulatedRevenue = Math.round(
        naicsModeledRev * 0.75 + lead.reportedRevenueUsd * 0.25
      );
      confidenceScore = 76;
      varianceWarning = `Raw scrape reported $${(
        lead.reportedRevenueUsd / 1e6
      ).toFixed(1)}M, which deviates ${Math.round(
        Math.abs(ratio - 1) * 100
      )}% from NAICS ${lead.naicsCode} headcount benchmark ($${(
        naicsModeledRev / 1e6
      ).toFixed(1)}M). Adjusted via NAICS weighting.`;
    } else {
      triangulatedRevenue = Math.round(
        naicsModeledRev * 0.55 + lead.reportedRevenueUsd * 0.45
      );
      confidenceScore = 94;
    }
  }

  // Adjust EBITDA margin slightly upward for high recurring B2B revenue
  const recurringBonusPct = lead.b2bRecurringPct >= 80 ? 2 : 0;
  const effectiveMarginPct = benchmark.medianEbitdaMarginPct + recurringBonusPct;
  const estimatedEbitda = Math.round(
    triangulatedRevenue * (effectiveMarginPct / 100)
  );

  return {
    naicsCode: lead.naicsCode,
    naicsDescription: benchmark.title,
    benchmarkRevPerEmployee: benchmark.revPerEmployeeUsd,
    benchmarkEbitdaMarginPct: effectiveMarginPct,
    rawScrapedRevenue: lead.reportedRevenueUsd,
    triangulatedRevenue,
    revenueLow: Math.round(triangulatedRevenue * 0.85),
    revenueHigh: Math.round(triangulatedRevenue * 1.15),
    estimatedEbitda,
    valuationLow: Math.round(estimatedEbitda * benchmark.typicalMultipleLow),
    valuationHigh: Math.round(estimatedEbitda * benchmark.typicalMultipleHigh),
    confidenceScore,
    varianceWarning,
  };
}

export function computeAiTransformationPlaybook(lead: RawLeadRecord): {
  aiUpsideScore: number;
  playbook: {
    initiative: string;
    estimatedEbitdaLiftPct: string;
    timeline: string;
  }[];
} {
  let score = 40;
  const playbook: {
    initiative: string;
    estimatedEbitdaLiftPct: string;
    timeline: string;
  }[] = [];

  if (!lead.hasAutomatedScheduling) {
    score += 20;
    playbook.push({
      initiative:
        "AI Automated Field Dispatch, Route Optimization & Preventative SLA Scheduling",
      estimatedEbitdaLiftPct: "+3.5% to +5.0% Margin Lift",
      timeline: "Months 1–6 Post-Close",
    });
  }

  if (!lead.hasCrmOrPortal) {
    score += 20;
    playbook.push({
      initiative:
        "Self-Serve B2B Client Portal + Automated Renewal & Invoice Collection Engine",
      estimatedEbitdaLiftPct: "+2.5% Working Capital & Retention Lift",
      timeline: "Months 3–9 Post-Close",
    });
  }

  if (lead.naicsCode === "541512") {
    score += 15;
    playbook.push({
      initiative:
        "Autonomous AI L1/L2 Helpdesk Ticket Triage & Alert Remediation (MSP Copilot)",
      estimatedEbitdaLiftPct: "+6.0% Gross Margin Expansion",
      timeline: "Months 2–8 Post-Close",
    });
  } else if (lead.naicsCode === "541380") {
    score += 15;
    playbook.push({
      initiative:
        "Vision/LLM Automated Inspection Certificate & Compliance Report Generation",
      estimatedEbitdaLiftPct: "+4.5% Technician Billable Utilization",
      timeline: "Months 2–6 Post-Close",
    });
  } else if (lead.naicsCode === "332710") {
    score += 15;
    playbook.push({
      initiative:
        "AI CAD-to-Quote Estimator (Reduces RFQ turnaround from 5 days to 15 mins)",
      estimatedEbitdaLiftPct: "+18% Quote Win-Rate & +4% Margin",
      timeline: "Months 4–12 Post-Close",
    });
  } else {
    score += 12;
    playbook.push({
      initiative:
        "SaaSquatch Outbound Engine Deployment for B2B Commercial Contract Expansion",
      estimatedEbitdaLiftPct: "+15% Organic ARR Growth",
      timeline: "Months 1–12 Post-Close",
    });
  }

  if (CURRENT_YEAR - lead.websiteLastUpdatedYear >= 5) {
    score += 10;
  }

  return {
    aiUpsideScore: Math.min(98, score),
    playbook,
  };
}

export function evaluateBuyBox(
  triangulation: RevenueTriangulation,
  successionScore: number,
  lead: RawLeadRecord,
  criteria: BuyBoxCriteria
): {
  buyBoxScore: number;
  buyBoxFlags: { criterion: string; passed: boolean; detail: string }[];
} {
  const flags: { criterion: string; passed: boolean; detail: string }[] = [];

  const revPassed =
    triangulation.triangulatedRevenue >= criteria.minRevenue &&
    triangulation.triangulatedRevenue <= criteria.maxRevenue;
  flags.push({
    criterion: "Revenue Band",
    passed: revPassed,
    detail: `$${(triangulation.triangulatedRevenue / 1e6).toFixed(
      2
    )}M vs target $${(criteria.minRevenue / 1e6).toFixed(1)}M–$${(
      criteria.maxRevenue / 1e6
    ).toFixed(1)}M`,
  });

  const ebitdaPassed =
    triangulation.estimatedEbitda >= criteria.minEbitda &&
    triangulation.estimatedEbitda <= criteria.maxEbitda;
  flags.push({
    criterion: "EBITDA Sizing",
    passed: ebitdaPassed,
    detail: `$${(triangulation.estimatedEbitda / 1e6).toFixed(
      2
    )}M Est. EBITDA (${triangulation.benchmarkEbitdaMarginPct}% margin)`,
  });

  const empPassed =
    lead.employeeCount >= criteria.minEmployees &&
    lead.employeeCount <= criteria.maxEmployees;
  flags.push({
    criterion: "Headcount Scale",
    passed: empPassed,
    detail: `${lead.employeeCount} FTEs (Target ${criteria.minEmployees}–${criteria.maxEmployees})`,
  });

  const succPassed = successionScore >= criteria.minSuccessionScore;
  flags.push({
    criterion: "Succession Readiness",
    passed: succPassed,
    detail: `Score ${successionScore}/100 (Min ${criteria.minSuccessionScore})`,
  });

  const ownPassed = criteria.excludeVcPeBacked
    ? lead.ownershipType !== "PE / VC Backed"
    : true;
  flags.push({
    criterion: "Ownership Independence",
    passed: ownPassed,
    detail: lead.ownershipType,
  });

  const recPassed = lead.b2bRecurringPct >= criteria.minRecurringPct;
  flags.push({
    criterion: "B2B Recurring Revenue",
    passed: recPassed,
    detail: `${lead.b2bRecurringPct}% repeat/contracted revenue`,
  });

  const weights = [20, 25, 10, 20, 15, 10];
  let totalScore = 0;
  flags.forEach((f, idx) => {
    if (f.passed) totalScore += weights[idx];
  });

  return {
    buyBoxScore: totalScore,
    buyBoxFlags: flags,
  };
}

export function buildEnrichedPipeline(
  rawLeads: RawLeadRecord[],
  criteria: BuyBoxCriteria
): {
  leads: EnrichedLead[];
  stats: {
    totalRawCount: number;
    uniqueCount: number;
    duplicatesRemoved: number;
    creditsSaved: number;
    qualifiedCount: number;
    silverTsunamiCount: number;
    aggregatePipelineEvUsd: number;
  };
} {
  const dedupResult = deduplicateRawLeads(rawLeads);

  const enrichedLeads: EnrichedLead[] = dedupResult.groups.map(
    (group: DeduplicatedGroup, idx: number) => {
      const lead = group.primary;
      const yearsInBusiness = Math.max(1, CURRENT_YEAR - lead.foundedYear);
      const breakdown = computeSuccessionBreakdown(lead);
      const successionScore =
        breakdown.tenureAndAgeScore +
        breakdown.successionVacuumScore +
        breakdown.digitalModernizationGapScore +
        breakdown.ownershipIndependenceScore;

      let successionTier: EnrichedLead["successionTier"] = "Low Intent";
      if (successionScore >= 82) {
        successionTier = "Critical (Silver Tsunami)";
      } else if (successionScore >= 68) {
        successionTier = "High Readiness";
      } else if (successionScore >= 50) {
        successionTier = "Moderate";
      }

      const triangulation = triangulateFinancials(lead);
      const aiResult = computeAiTransformationPlaybook(lead);
      const buyBoxEval = evaluateBuyBox(
        triangulation,
        successionScore,
        lead,
        criteria
      );

      // Default pipeline stage assignment
      let defaultStage: EnrichedLead["pipelineStage"] = "inbox";
      if (lead.ownershipType === "PE / VC Backed") {
        defaultStage = "passed";
      } else if (buyBoxEval.buyBoxScore >= 85 && successionScore >= 80) {
        defaultStage = "qualified";
      }

      return {
        ...lead,
        id: `SQ-TARGET-${101 + idx}`,
        canonicalDomain: group.canonicalDomain,
        normalizedName: group.normalizedName,
        yearsInBusiness,
        estimatedOwnerAge: 32 + lead.ownerTenureYears,
        sources: group.sources,
        mergedDuplicateCount: group.mergedDuplicateCount,
        duplicateRecordsMerged: group.duplicateRecordsMerged,
        emailVerificationStatus: lead.ownerEmail.startsWith("info@")
          ? "Catch-All"
          : "Verified",
        successionScore,
        successionTier,
        successionBreakdown: breakdown,
        triangulation,
        aiUpsideScore: aiResult.aiUpsideScore,
        aiValueCreationPlaybook: aiResult.playbook,
        buyBoxScore: buyBoxEval.buyBoxScore,
        buyBoxFlags: buyBoxEval.buyBoxFlags,
        pipelineStage: defaultStage,
        creditUnlocked: idx < 5, // First 5 pre-unlocked in demo
      };
    }
  );

  // Sort by combined Buy-Box + Succession Score descending
  enrichedLeads.sort(
    (a, b) =>
      b.buyBoxScore * 0.55 +
      b.successionScore * 0.45 -
      (a.buyBoxScore * 0.55 + a.successionScore * 0.45)
  );

  const qualifiedLeads = enrichedLeads.filter((l) => l.buyBoxScore >= 80);
  const silverTsunamiCount = enrichedLeads.filter(
    (l) => l.successionScore >= 75
  ).length;
  const aggregatePipelineEvUsd = qualifiedLeads.reduce(
    (sum, l) =>
      sum +
      Math.round(
        (l.triangulation.valuationLow + l.triangulation.valuationHigh) / 2
      ),
    0
  );

  return {
    leads: enrichedLeads,
    stats: {
      totalRawCount: dedupResult.totalRawCount,
      uniqueCount: dedupResult.uniqueCount,
      duplicatesRemoved: dedupResult.duplicatesRemoved,
      creditsSaved: dedupResult.creditsSaved,
      qualifiedCount: qualifiedLeads.length,
      silverTsunamiCount,
      aggregatePipelineEvUsd,
    },
  };
}
