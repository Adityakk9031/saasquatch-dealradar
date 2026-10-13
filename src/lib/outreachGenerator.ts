import { EnrichedLead } from "@/types/leads";

export type OutreachAngle =
  | "legacy_stewardship"
  | "caprae_7yr_ai"
  | "direct_principal";

export interface GeneratedOutreachPack {
  subjectLine: string;
  emailBody: string;
  linkedInNote: string;
  coldCallScript: string;
  dealMemoMarkdown: string;
}

export function generateOutreachAndMemo(
  lead: EnrichedLead,
  angle: OutreachAngle = "legacy_stewardship",
  senderName: string = "Managing Principal, Caprae Acquisition Partners"
): GeneratedOutreachPack {
  const firstName = lead.ownerName.includes("@")
    ? "Founder"
    : lead.ownerName.split(" ")[0];
  const revM = (lead.triangulation.triangulatedRevenue / 1e6).toFixed(2);
  const ebitdaM = (lead.triangulation.estimatedEbitda / 1e6).toFixed(2);
  const valLowM = (lead.triangulation.valuationLow / 1e6).toFixed(2);
  const valHighM = (lead.triangulation.valuationHigh / 1e6).toFixed(2);

  let subjectLine = "";
  let emailBody = "";

  if (angle === "legacy_stewardship") {
    subjectLine = `Confidential note regarding ${lead.companyName} (${lead.yearsInBusiness} yrs in ${lead.city})`;
    emailBody = `Dear ${firstName},

I have been researching established ${lead.industry.toLowerCase()} leaders across ${lead.state}, and ${lead.companyName} consistently stood out—particularly your ${lead.yearsInBusiness}-year track record since ${lead.foundedYear} and the reputation you've built with commercial clients in ${lead.city}.

I am reaching out directly as an operator-investor (not a business broker). Unlike traditional private equity firms that rely on heavy financial engineering or strip down local teams, we approach acquisitions as a 7-year operational stewardship journey. Our priority is preserving your company name, protecting your ${lead.employeeCount} employees, and giving a long-tenured founder a clean, confidential transition on their own timeline.

Even if an exit isn't on your radar for another 12–24 months, would you be open to a brief, strictly confidential 10-minute introductory call next Tuesday or Thursday?

Warm regards,
${senderName}`;
  } else if (angle === "caprae_7yr_ai") {
    subjectLine = `${lead.companyName} — Operational Growth & Succession Partnership`;
    emailBody = `Hi ${firstName},

Building and leading ${lead.companyName} for ${lead.ownerTenureYears} years in the ${lead.industry.toLowerCase()} space is a rare achievement. Your recurring commercial client base (${lead.b2bRecurringPct}% repeat revenue) is the exact foundation we look to back.

At Caprae Capital, we partner with seasoned founders who have built enduring technical and field operations (${lead.triangulation.naicsDescription}) and want to unlock the next phase of growth—or structure a phased succession—without handing the keys to a Wall Street consolidator. We bring an in-house engineering and AI team to automate back-office dispatch, compliance reporting, and customer acquisition while keeping your core technical team intact.

Are you open to a low-pressure, 12-minute conversation this week to share how we structure founder-friendly transitions in ${lead.state}?

Best regards,
${senderName}`;
  } else {
    subjectLine = `Direct Principal Inquiry: ${lead.companyName} (${lead.city}, ${lead.state})`;
    emailBody = `${firstName},

I'm writing to you directly because we are actively acquiring one premier ${lead.industry.toLowerCase()} platform in ${lead.state} this quarter, and ${lead.companyName}'s ${lead.yearsInBusiness}-year operating history and ${lead.employeeCount}-person team fit our exact acquisition criteria.

Because we invest our own committed capital alongside operator-principals:
• Zero broker commissions or intermediary drag
• Strict confidentiality (your employees, customers, and vendors never know)
• Flexible structure: 100% buyout or majority recapitalization with a smooth handover

If you have ever considered what a succession plan might look like for ${lead.companyName}, let's connect for 10 minutes at your convenience.

Sincerely,
${senderName}`;
  }

  const linkedInNote = `Hi ${firstName} — deeply impressed by the ${lead.yearsInBusiness}-year track record you've built at ${lead.companyName} in ${lead.city}. I'm an operator-focused buyer researching ${lead.industry} leaders in ${lead.state} (not a broker). Would love to connect directly.`;

  const coldCallScript = `[SaaSquatch White-Glove Pro Call Script — Target: ${lead.ownerName}, ${lead.ownerTitle}]
1. OPENER (Zero Fluff):
"Hi ${firstName}, this is [Caller] calling on behalf of our Managing Principal at Caprae. I know you're running day-to-day operations at ${lead.companyName}, so I'll be brief—do you have 45 seconds?"

2. CONTEXT & CREDIBILITY:
"We're an operator-led investment group—not brokers—and we've been studying ${lead.industry} companies in ${lead.state}. Your ${lead.yearsInBusiness}-year history since ${lead.foundedYear} caught our attention."

3. QUALIFICATION QUESTION:
"We partner with founders who may be thinking about succession or taking chips off the table over the next 1 to 3 years while protecting their ${lead.employeeCount} staff. If the valuation and cultural fit made sense, would you be open to a confidential 15-minute intro call with our Principal on Calendly?"`;

  const dealMemoMarkdown = `# CAPRAE CAPITAL — 60-MINUTE LBO & DEAL SCREENING MEMO
**Target Entity:** ${lead.companyName} (${lead.canonicalDomain})
**Location:** ${lead.city}, ${lead.state} | **Founded:** ${lead.foundedYear} (${lead.yearsInBusiness} Yrs Operating)
**NAICS Classification:** ${lead.naicsCode} — ${lead.triangulation.naicsDescription}
**Owner / Principal:** ${lead.ownerName} (${lead.ownerTitle}, ${lead.ownerTenureYears} yrs tenure, Est. Age ~${lead.estimatedOwnerAge})

---

## 1. SUCCESSION RISK & BUY-BOX SCORECARD
* **Succession Risk Index™:** **${lead.successionScore}/100** (${lead.successionTier})
* **Searcher Buy-Box Match:** **${lead.buyBoxScore}/100**
* **Post-Acquisition AI Upside Score:** **${lead.aiUpsideScore}/100**
* **Multi-Source Verification:** Aggregated across ${lead.sources.join(", ")} (${lead.mergedDuplicateCount} duplicate records merged)

### Key Succession Rationale:
${lead.successionBreakdown.rationale.map((r) => `- ${r}`).join("\n")}

---

## 2. DEFENSIBLE FINANCIAL TRIANGULATION & 60-MINUTE LBO SIZING
* **Headcount:** ${lead.employeeCount} Full-Time Employees
* **NAICS Benchmark Multiplier:** $${(lead.triangulation.benchmarkRevPerEmployee / 1000).toFixed(0)}k Revenue / Employee
* **Triangulated Annual Revenue:** **$${revM}M** (Range: $${(lead.triangulation.revenueLow / 1e6).toFixed(2)}M – $${(lead.triangulation.revenueHigh / 1e6).toFixed(2)}M)
* **Estimated EBITDA (${lead.triangulation.benchmarkEbitdaMarginPct}% Margin):** **$${ebitdaM}M** (${lead.b2bRecurringPct}% B2B Recurring/Repeat)
* **Implied Enterprise Value Range:** **$${valLowM}M – $${valHighM}M** (3.5x – 5.0x LMM EBITDA)
* **Illustrative Capital Structure:**
  * Senior / SBA Debt (60%): $${((lead.triangulation.valuationLow * 0.6) / 1e6).toFixed(2)}M
  * Seller Financing Rollover (20%): $${((lead.triangulation.valuationLow * 0.2) / 1e6).toFixed(2)}M
  * Searcher / Caprae Equity (20%): $${((lead.triangulation.valuationLow * 0.2) / 1e6).toFixed(2)}M

---

## 3. CAPRAE 7-YEAR POST-ACQUISITION AI VALUE CREATION ROADMAP
*Current Legacy Tech Stack:* ${lead.techStack.join(", ")} (Website last updated: ${lead.websiteLastUpdatedYear})

${lead.aiValueCreationPlaybook
  .map(
    (item, idx) =>
      `${idx + 1}. **${item.initiative}**\n   - *Target Impact:* ${item.estimatedEbitdaLiftPct} | *Execution Window:* ${item.timeline}`
  )
  .join("\n")}
`;

  return {
    subjectLine,
    emailBody,
    linkedInNote,
    coldCallScript,
    dealMemoMarkdown,
  };
}
