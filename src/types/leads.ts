export type DataSource =
  | "Apollo"
  | "Google Maps"
  | "LinkedIn"
  | "Growjo"
  | "Crunchbase";

export type PipelineStage =
  | "inbox"
  | "qualified"
  | "outreach_sent"
  | "diligence"
  | "passed";

export type OwnershipType =
  | "Founder / Family Owned"
  | "Bootstrapped Partnership"
  | "PE / VC Backed"
  | "Corporate Subsidiary";

export interface RawLeadRecord {
  rawId: string;
  source: DataSource;
  companyName: string;
  website: string;
  industry: string;
  naicsCode: string;
  city: string;
  state: string;
  foundedYear: number;
  employeeCount: number;
  reportedRevenueUsd?: number; // Often missing or noisy in raw scrapes
  ownerName: string;
  ownerTitle: string;
  ownerTenureYears: number;
  ownerEmail: string;
  ownerPhone: string;
  ownerLinkedIn: string;
  hasSecondTierManagement: boolean;
  ownershipType: OwnershipType;
  techStack: string[];
  websiteLastUpdatedYear: number;
  hasAutomatedScheduling: boolean;
  hasCrmOrPortal: boolean;
  googleRating?: number;
  googleReviews?: number;
  b2bRecurringPct: number; // Estimated % of recurring/repeat commercial revenue
  notes?: string;
}

export interface SuccessionBreakdown {
  tenureAndAgeScore: number; // Max 35
  successionVacuumScore: number; // Max 25
  digitalModernizationGapScore: number; // Max 20
  ownershipIndependenceScore: number; // Max 20
  rationale: string[];
}

export interface RevenueTriangulation {
  naicsCode: string;
  naicsDescription: string;
  benchmarkRevPerEmployee: number;
  benchmarkEbitdaMarginPct: number;
  rawScrapedRevenue?: number;
  triangulatedRevenue: number;
  revenueLow: number;
  revenueHigh: number;
  estimatedEbitda: number;
  valuationLow: number; // 3.5x EBITDA
  valuationHigh: number; // 5.0x EBITDA
  confidenceScore: number; // 0-100
  varianceWarning?: string;
}

export interface BuyBoxCriteria {
  presetId: string;
  minRevenue: number;
  maxRevenue: number;
  minEbitda: number;
  maxEbitda: number;
  minEmployees: number;
  maxEmployees: number;
  minSuccessionScore: number;
  selectedIndustries: string[];
  excludeVcPeBacked: boolean;
  minRecurringPct: number;
}

export interface EnrichedLead extends RawLeadRecord {
  id: string;
  canonicalDomain: string;
  normalizedName: string;
  yearsInBusiness: number;
  estimatedOwnerAge: number;
  sources: DataSource[];
  mergedDuplicateCount: number;
  duplicateRecordsMerged: {
    rawId: string;
    source: DataSource;
    companyNameVariation: string;
    reason: string;
  }[];
  emailVerificationStatus: "Verified" | "Catch-All" | "Unverified";
  successionScore: number; // 0-100
  successionTier: "Critical (Silver Tsunami)" | "High Readiness" | "Moderate" | "Low Intent";
  successionBreakdown: SuccessionBreakdown;
  triangulation: RevenueTriangulation;
  aiUpsideScore: number; // 0-100 Post-Acquisition 7-Year AI Transformation Score
  aiValueCreationPlaybook: {
    initiative: string;
    estimatedEbitdaLiftPct: string;
    timeline: string;
  }[];
  buyBoxScore: number; // 0-100
  buyBoxFlags: {
    criterion: string;
    passed: boolean;
    detail: string;
  }[];
  pipelineStage: PipelineStage;
  creditUnlocked: boolean;
}
