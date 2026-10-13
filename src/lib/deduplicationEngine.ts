import { RawLeadRecord } from "@/types/leads";

export function canonicalizeDomain(url: string): string {
  if (!url) return "";
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(
      /\b(llc|inc|corp|corporation|co|company|ltd|partners|services|solutions|systems)\b/g,
      ""
    )
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}

export interface DeduplicatedGroup {
  primary: RawLeadRecord;
  canonicalDomain: string;
  normalizedName: string;
  sources: RawLeadRecord["source"][];
  mergedDuplicateCount: number;
  duplicateRecordsMerged: {
    rawId: string;
    source: RawLeadRecord["source"];
    companyNameVariation: string;
    reason: string;
  }[];
}

export function deduplicateRawLeads(rawLeads: RawLeadRecord[]): {
  groups: DeduplicatedGroup[];
  totalRawCount: number;
  uniqueCount: number;
  duplicatesRemoved: number;
  creditsSaved: number;
} {
  const mapByKey = new Map<string, DeduplicatedGroup>();

  for (const record of rawLeads) {
    const domain = canonicalizeDomain(record.website);
    const normName = normalizeCompanyName(record.companyName);
    const normPhone = normalizePhone(record.ownerPhone);

    // Match key priority: canonical domain -> normalized phone -> normalized name
    let matchKey: string | null = null;
    let matchReason = "Exact Canonical Domain Match";

    for (const [key, existing] of Array.from(mapByKey.entries())) {
      if (domain && existing.canonicalDomain === domain) {
        matchKey = key;
        matchReason = `Canonical Domain (${domain}) + E.164 Phone Match`;
        break;
      }
      if (
        normPhone &&
        normalizePhone(existing.primary.ownerPhone) === normPhone
      ) {
        matchKey = key;
        matchReason = `Normalized E.164 Phone (${normPhone}) Match`;
        break;
      }
      if (normName && existing.normalizedName === normName) {
        matchKey = key;
        matchReason = `Fuzzy Entity Name Resolution (${normName})`;
        break;
      }
    }

    if (!matchKey) {
      const newKey = domain || normPhone || normName || record.rawId;
      mapByKey.set(newKey, {
        primary: { ...record },
        canonicalDomain: domain,
        normalizedName: normName,
        sources: [record.source],
        mergedDuplicateCount: 0,
        duplicateRecordsMerged: [],
      });
    } else {
      const group = mapByKey.get(matchKey)!;
      if (!group.sources.includes(record.source)) {
        group.sources.push(record.source);
      }
      group.mergedDuplicateCount += 1;
      group.duplicateRecordsMerged.push({
        rawId: record.rawId,
        source: record.source,
        companyNameVariation: record.companyName,
        reason: matchReason,
      });

      // Golden Record survivor rules:
      // 1. Prefer direct executive email over generic info@/contact@
      if (
        group.primary.ownerEmail.startsWith("info@") &&
        !record.ownerEmail.startsWith("info@")
      ) {
        group.primary.ownerEmail = record.ownerEmail;
      }
      // 2. Union techStack signals
      const combinedTech = Array.from(
        new Set([...group.primary.techStack, ...record.techStack])
      );
      group.primary.techStack = combinedTech;

      // 3. Preserve Google Maps rating/reviews if missing on primary
      if (!group.primary.googleRating && record.googleRating) {
        group.primary.googleRating = record.googleRating;
        group.primary.googleReviews = record.googleReviews;
      }

      // 4. Preserve richer notes
      if (!group.primary.notes && record.notes) {
        group.primary.notes = record.notes;
      }
    }
  }

  const groups = Array.from(mapByKey.values());
  const duplicatesRemoved = rawLeads.length - groups.length;

  return {
    groups,
    totalRawCount: rawLeads.length,
    uniqueCount: groups.length,
    duplicatesRemoved,
    creditsSaved: duplicatesRemoved, // 1 SaaSquatch enrichment credit saved per duplicate suppressed
  };
}
