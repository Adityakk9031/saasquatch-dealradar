"use client";

import React, { useState } from "react";
import { EnrichedLead, PipelineStage } from "@/types/leads";
import {
  generateOutreachAndMemo,
  OutreachAngle,
} from "@/lib/outreachGenerator";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Mail,
  FileText,
  Copy,
  Check,
  Download,
  Phone,
  Linkedin,
  Globe,
  Layers,
  TrendingUp,
  Award,
  Sparkles,
  Building2,
} from "lucide-react";

interface LeadDossierDrawerProps {
  lead: EnrichedLead | null;
  onClose: () => void;
  onUpdateStage: (leadId: string, stage: PipelineStage) => void;
  onUnlockCredit: (leadId: string) => void;
}

export default function LeadDossierDrawer({
  lead,
  onClose,
  onUpdateStage,
  onUnlockCredit,
}: LeadDossierDrawerProps) {
  const [activeTab, setActiveTab] = useState<
    "dossier" | "outreach" | "memo"
  >("dossier");
  const [angle, setAngle] = useState<OutreachAngle>("legacy_stewardship");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!lead) return null;

  const outreachPack = generateOutreachAndMemo(lead, angle);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadMemo = () => {
    const blob = new Blob([outreachPack.dealMemoMarkdown], {
      type: "text/markdown;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lead.canonicalDomain.replace(/\./g, "_")}_Caprae_IC_Memo.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0d1322] border-l border-white/15 h-full flex flex-col shadow-2xl overflow-hidden text-gray-100">
        {/* Top Header */}
        <div className="px-6 py-5 bg-[#131c31] border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {lead.id}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                NAICS {lead.naicsCode} • {lead.industry}
              </span>
              {lead.mergedDuplicateCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Layers className="w-3 h-3" />+{lead.mergedDuplicateCount} Duplicates Merged
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
              {lead.companyName}
            </h2>
            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                {lead.city}, {lead.state} • Founded {lead.foundedYear} (
                {lead.yearsInBusiness} yrs)
              </span>
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-teal-400 hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                {lead.canonicalDomain}
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs & Stage Selector */}
        <div className="px-6 py-3 bg-[#101729] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("dossier")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "dossier"
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              M&A Succession & Financials
            </button>
            <button
              onClick={() => setActiveTab("outreach")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "outreach"
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Founder Succession Outreach
            </button>
            <button
              onClick={() => setActiveTab("memo")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "memo"
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              60-Min LBO Deal Memo
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Pipeline Stage:</span>
            <select
              value={lead.pipelineStage}
              onChange={(e) =>
                onUpdateStage(lead.id, e.target.value as PipelineStage)
              }
              className="bg-[#1a2236] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-300 focus:outline-none focus:border-teal-400"
            >
              <option value="inbox">Raw Inbox</option>
              <option value="qualified">Buy-Box Qualified</option>
              <option value="outreach_sent">Outreach Sent</option>
              <option value="diligence">NDA / Diligence</option>
              <option value="passed">Passed / Disqualified</option>
            </select>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "dossier" && (
            <>
              {/* Score Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#161f33] border border-teal-500/30">
                  <div className="text-xs text-gray-400 uppercase font-semibold">
                    Succession Risk Index™
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-teal-400">
                      {lead.successionScore}
                    </span>
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-teal-300">
                    {lead.successionTier}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161f33] border border-blue-500/30">
                  <div className="text-xs text-gray-400 uppercase font-semibold">
                    Searcher Buy-Box Fit
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-blue-400">
                      {lead.buyBoxScore}%
                    </span>
                    <span className="text-xs text-gray-400">Alignment</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-300">
                    {lead.buyBoxFlags.filter((f) => f.passed).length} of{" "}
                    {lead.buyBoxFlags.length} criteria passed
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161f33] border border-purple-500/30">
                  <div className="text-xs text-gray-400 uppercase font-semibold">
                    7-Yr AI Upside Score
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-purple-400">
                      {lead.aiUpsideScore}
                    </span>
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                  <div className="mt-1 text-xs text-purple-300">
                    High Post-Close Margin Lift
                  </div>
                </div>
              </div>

              {/* Principal Contact & 1-Credit Unlock Card */}
              <div className="p-5 rounded-xl bg-[#151d30] border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    Decision-Maker & Golden Record Contact Profile
                  </h3>
                  {!lead.creditUnlocked ? (
                    <button
                      onClick={() => onUnlockCredit(lead.id)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold shadow hover:opacity-95 transition"
                    >
                      Unlock Full Profile (1 Credit)
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                      ✔ Enriched & Cross-Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-400">Principal / Owner</div>
                    <div className="font-semibold text-white">
                      {lead.ownerName} •{" "}
                      <span className="text-teal-300">{lead.ownerTitle}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Tenure: <b>{lead.ownerTenureYears} yrs</b> (Est. Age ~
                      {lead.estimatedOwnerAge}) •{" "}
                      {lead.hasSecondTierManagement
                        ? "2nd-Tier COO/VP Present"
                        : "No Successor / Heir Apparent"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="w-3.5 h-3.5 text-teal-400" />
                      <span className="font-mono text-gray-200">
                        {lead.creditUnlocked
                          ? lead.ownerEmail
                          : lead.ownerEmail.replace(/^(.)(.*)(@.*)$/, "$1***$3")}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {lead.emailVerificationStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-mono text-gray-200">
                        {lead.creditUnlocked
                          ? lead.ownerPhone
                          : "(•••) •••-" + lead.ownerPhone.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-sky-400 truncate">
                        {lead.ownerLinkedIn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Defensible Revenue & EBITDA Triangulation */}
              <div className="p-5 rounded-xl bg-[#151d30] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    Defensible NAICS Revenue & EBITDA Triangulation
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-500/15 text-teal-300">
                    Confidence: {lead.triangulation.confidenceScore}%
                  </span>
                </div>

                {lead.triangulation.varianceWarning && (
                  <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-start gap-2.5 text-xs text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        Scraper Hallucination Guard Triggered:{" "}
                      </span>
                      {lead.triangulation.varianceWarning}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-[#0d1322] border border-white/5">
                    <div className="text-[11px] text-gray-400">
                      Headcount × NAICS
                    </div>
                    <div className="text-sm font-bold text-white mt-1">
                      {lead.employeeCount} × $
                      {(lead.triangulation.benchmarkRevPerEmployee / 1000).toFixed(
                        0
                      )}
                      k
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0d1322] border border-white/5">
                    <div className="text-[11px] text-gray-400">
                      Triangulated Rev
                    </div>
                    <div className="text-sm font-bold text-teal-400 mt-1">
                      ${(lead.triangulation.triangulatedRevenue / 1e6).toFixed(2)}M
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0d1322] border border-white/5">
                    <div className="text-[11px] text-gray-400">
                      Est. EBITDA ({lead.triangulation.benchmarkEbitdaMarginPct}%)
                    </div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">
                      ${(lead.triangulation.estimatedEbitda / 1e6).toFixed(2)}M
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0d1322] border border-white/5">
                    <div className="text-[11px] text-gray-400">
                      Implied EV (3.5x–5x)
                    </div>
                    <div className="text-sm font-bold text-blue-400 mt-1">
                      ${(lead.triangulation.valuationLow / 1e6).toFixed(1)}M–$
                      {(lead.triangulation.valuationHigh / 1e6).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Factor Succession Risk Breakdown */}
              <div className="p-5 rounded-xl bg-[#151d30] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  Succession Risk Index™ Factor Decomposition
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">
                        1. Founder Tenure & Operating History (Max 35 pts)
                      </span>
                      <span className="font-bold text-teal-400">
                        {lead.successionBreakdown.tenureAndAgeScore} / 35
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-teal-500"
                        style={{
                          width: `${
                            (lead.successionBreakdown.tenureAndAgeScore / 35) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">
                        2. Succession Vacuum / Second-Tier Absence (Max 25 pts)
                      </span>
                      <span className="font-bold text-blue-400">
                        {lead.successionBreakdown.successionVacuumScore} / 25
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${
                            (lead.successionBreakdown.successionVacuumScore / 25) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">
                        3. Digital & Legacy Tech Debt Lag (Max 20 pts)
                      </span>
                      <span className="font-bold text-purple-400">
                        {lead.successionBreakdown.digitalModernizationGapScore} / 20
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${
                            (lead.successionBreakdown.digitalModernizationGapScore /
                              20) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">
                        4. Direct Founder / Family Ownership (Max 20 pts)
                      </span>
                      <span className="font-bold text-emerald-400">
                        {lead.successionBreakdown.ownershipIndependenceScore} / 20
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            (lead.successionBreakdown.ownershipIndependenceScore /
                              20) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <ul className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-gray-300">
                  {lead.successionBreakdown.rationale.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Caprae 7-Year AI Value Creation Playbook */}
              <div className="p-5 rounded-xl bg-[#151d30] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    Caprae 7-Year Post-Acquisition AI Transformation Roadmap
                  </h3>
                  <span className="text-xs text-gray-400">
                    Site Updated: {lead.websiteLastUpdatedYear}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {lead.techStack.map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 text-[11px] rounded bg-white/5 text-gray-300 border border-white/10"
                    >
                      Legacy Signal: {t}
                    </span>
                  ))}
                </div>

                <div className="space-y-2.5 pt-2">
                  {lead.aiValueCreationPlaybook.map((step, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#0d1322] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="text-xs font-semibold text-white">
                        {i + 1}. {step.initiative}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          {step.estimatedEbitdaLiftPct}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {step.timeline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Source Deduplication Audit */}
              <div className="p-5 rounded-xl bg-[#151d30] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  Multi-Source Entity Resolution & Deduplication Log
                </h3>
                <div className="text-xs text-gray-400">
                  Sources Combined:{" "}
                  <b className="text-white">{lead.sources.join(" + ")}</b>
                </div>
                {lead.duplicateRecordsMerged.length === 0 ? (
                  <div className="text-xs text-gray-400 italic">
                    Single canonical source record — no conflicting duplicates
                    found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lead.duplicateRecordsMerged.map((dup, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded bg-[#0d1322] border border-white/5 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-purple-300">
                            [{dup.source}]
                          </span>{" "}
                          <span className="text-gray-200">
                            &ldquo;{dup.companyNameVariation}&rdquo;
                          </span>{" "}
                          <span className="text-gray-500">({dup.rawId})</span>
                        </div>
                        <span className="text-teal-400 font-medium">
                          Merged ({dup.reason}) • +1 Credit Saved
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "outreach" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#151d30] border border-teal-500/30">
                <div className="text-xs font-bold uppercase text-teal-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Select Founder-to-Founder M&A Outreach Angle
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setAngle("legacy_stewardship")}
                    className={`p-2.5 rounded-lg text-left text-xs border transition ${
                      angle === "legacy_stewardship"
                        ? "bg-teal-500/20 border-teal-400 text-white font-semibold"
                        : "bg-[#0d1322] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    1. Legacy & Employee Stewardship
                  </button>
                  <button
                    onClick={() => setAngle("caprae_7yr_ai")}
                    className={`p-2.5 rounded-lg text-left text-xs border transition ${
                      angle === "caprae_7yr_ai"
                        ? "bg-teal-500/20 border-teal-400 text-white font-semibold"
                        : "bg-[#0d1322] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    2. Caprae 7-Yr AI Operational Partner
                  </button>
                  <button
                    onClick={() => setAngle("direct_principal")}
                    className={`p-2.5 rounded-lg text-left text-xs border transition ${
                      angle === "direct_principal"
                        ? "bg-teal-500/20 border-teal-400 text-white font-semibold"
                        : "bg-[#0d1322] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    3. Direct Principal (Zero Broker Fee)
                  </button>
                </div>
              </div>

              {/* Email Output */}
              <div className="p-5 rounded-xl bg-[#151d30] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-gray-300">
                    Personalized Founder Acquisition Email
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleCopy(
                          `Subject: ${outreachPack.subjectLine}\n\n${outreachPack.emailBody}`,
                          "email"
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 text-white transition"
                    >
                      {copiedField === "email" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Email
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onUpdateStage(lead.id, "outreach_sent")}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-xs font-semibold text-white"
                    >
                      Mark Outreach Sent
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0d1322] border border-white/10 text-xs text-teal-300 font-semibold">
                  Subject: {outreachPack.subjectLine}
                </div>
                <pre className="p-4 rounded-lg bg-[#0d1322] border border-white/10 text-xs text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {outreachPack.emailBody}
                </pre>
              </div>

              {/* LinkedIn Note */}
              <div className="p-5 rounded-xl bg-[#151d30] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-gray-300">
                    LinkedIn Founder Direct Invite Note ({outreachPack.linkedInNote.length}/300 chars)
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(outreachPack.linkedInNote, "linkedin")
                    }
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-xs flex items-center gap-1"
                  >
                    {copiedField === "linkedin" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copy
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-[#0d1322] border border-white/10 text-xs text-gray-200">
                  {outreachPack.linkedInNote}
                </div>
              </div>

              {/* White-Glove Cold Call Script */}
              <div className="p-5 rounded-xl bg-[#151d30] border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-blue-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    SaaSquatch Pro Call Outreach Script (White-Glove Team Ready)
                  </span>
                  <button
                    onClick={() => handleCopy(outreachPack.coldCallScript, "call")}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-xs flex items-center gap-1"
                  >
                    {copiedField === "call" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copy Script
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-[#0d1322] border border-white/10 text-xs text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {outreachPack.coldCallScript}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "memo" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#151d30] p-4 rounded-xl border border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Caprae Investment Committee 1-Page Deal Memo
                  </h3>
                  <p className="text-xs text-gray-400">
                    Includes 60-Minute LBO Sizing, NAICS Valuation Triangulation &
                    7-Year AI Roadmap
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleCopy(outreachPack.dealMemoMarkdown, "memo")
                    }
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copiedField === "memo" ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy Markdown
                  </button>
                  <button
                    onClick={handleDownloadMemo}
                    className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-4 h-4" />
                    Download Memo (.md)
                  </button>
                </div>
              </div>

              <pre className="p-5 rounded-xl bg-[#090d18] border border-white/10 text-xs text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
                {outreachPack.dealMemoMarkdown}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
