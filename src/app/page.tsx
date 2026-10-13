"use client";

import React, { useState, useMemo } from "react";
import { RAW_SCRAPED_LEADS, NAICS_BENCHMARKS } from "@/data/rawLeadsDataset";
import { BUY_BOX_PRESETS, buildEnrichedPipeline } from "@/lib/scoringEngine";
import {
  BuyBoxCriteria,
  EnrichedLead,
  PipelineStage,
  RawLeadRecord,
} from "@/types/leads";
import LeadDossierDrawer from "@/components/LeadDossierDrawer";
import LiveScraperLab from "@/components/LiveScraperLab";
import {
  Search,
  Filter,
  Download,
  Sparkles,
  ShieldAlert,
  Layers,
  TrendingUp,
  Table2,
  Kanban,
  Globe,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Mail,
  FileSpreadsheet,
  SlidersHorizontal,
  ArrowUpRight,
  Building2,
  Zap,
} from "lucide-react";

const STAGE_COLUMNS: {
  key: PipelineStage;
  title: string;
  badgeColor: string;
}[] = [
  {
    key: "inbox",
    title: "Raw Scraped Inbox",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  },
  {
    key: "qualified",
    title: "Buy-Box Qualified",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  {
    key: "outreach_sent",
    title: "Founder Outreach Sent",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    key: "diligence",
    title: "NDA / 60-Min LBO",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    key: "passed",
    title: "Passed / VC-PE Trap",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
];

export default function SaaSquatchDealRadarPage() {
  const [rawLeads, setRawLeads] = useState<RawLeadRecord[]>(RAW_SCRAPED_LEADS);
  const [activePresetKey, setActivePresetKey] =
    useState<string>("eta_flagship");
  const [criteria, setCriteria] = useState<BuyBoxCriteria>(
    BUY_BOX_PRESETS.eta_flagship.criteria
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [onlyQualified, setOnlyQualified] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<
    "table" | "kanban" | "scraper" | "analytics"
  >("table");

  // Track manual stage overrides and credit unlocks by lead ID
  const [stageOverrides, setStageOverrides] = useState<
    Record<string, PipelineStage>
  >({});
  const [unlockedIds, setUnlockedIds] = useState<Record<string, boolean>>({});
  const [creditsRemaining, setCreditsRemaining] = useState<number>(95);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const pipeline = useMemo(() => {
    return buildEnrichedPipeline(rawLeads, criteria);
  }, [rawLeads, criteria]);

  const enrichedLeadsWithState: EnrichedLead[] = useMemo(() => {
    return pipeline.leads.map((lead) => ({
      ...lead,
      pipelineStage: stageOverrides[lead.id] || lead.pipelineStage,
      creditUnlocked: unlockedIds[lead.id] ?? lead.creditUnlocked,
    }));
  }, [pipeline.leads, stageOverrides, unlockedIds]);

  const filteredLeads = useMemo(() => {
    return enrichedLeadsWithState.filter((lead) => {
      if (
        selectedIndustry !== "ALL" &&
        lead.industry !== selectedIndustry
      ) {
        return false;
      }
      if (onlyQualified && lead.buyBoxScore < 75) {
        return false;
      }
      if (lead.successionScore < criteria.minSuccessionScore) {
        return false;
      }
      if (
        criteria.excludeVcPeBacked &&
        lead.ownershipType === "PE / VC Backed"
      ) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const match =
          lead.companyName.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q) ||
          lead.state.toLowerCase().includes(q) ||
          lead.ownerName.toLowerCase().includes(q) ||
          lead.industry.toLowerCase().includes(q) ||
          lead.canonicalDomain.toLowerCase().includes(q) ||
          lead.techStack.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [
    enrichedLeadsWithState,
    selectedIndustry,
    onlyQualified,
    criteria.minSuccessionScore,
    criteria.excludeVcPeBacked,
    searchQuery,
  ]);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return (
      enrichedLeadsWithState.find((l) => l.id === selectedLeadId) || null
    );
  }, [selectedLeadId, enrichedLeadsWithState]);

  const handleSelectPreset = (presetKey: string) => {
    setActivePresetKey(presetKey);
    const preset = BUY_BOX_PRESETS[presetKey];
    if (preset) {
      setCriteria({ ...preset.criteria });
    }
  };

  const handleUpdateStage = (leadId: string, stage: PipelineStage) => {
    setStageOverrides((prev) => ({ ...prev, [leadId]: stage }));
  };

  const handleUnlockCredit = (leadId: string) => {
    if (!unlockedIds[leadId]) {
      setUnlockedIds((prev) => ({ ...prev, [leadId]: true }));
      setCreditsRemaining((c) => Math.max(0, c - 1));
    }
  };

  const handleAddRawLeads = (newRecords: RawLeadRecord[]) => {
    setRawLeads((prev) => [...newRecords, ...prev]);
  };

  const handleExportCsv = () => {
    const headers = [
      "Target_ID",
      "Company_Name",
      "Domain",
      "Industry",
      "NAICS",
      "City",
      "State",
      "Founded_Year",
      "Years_Operating",
      "Employees",
      "Triangulated_Revenue_USD",
      "Estimated_EBITDA_USD",
      "Implied_EV_Low_USD",
      "Implied_EV_High_USD",
      "Succession_Risk_Score",
      "Succession_Tier",
      "BuyBox_Match_Pct",
      "AI_Upside_Score",
      "Owner_Name",
      "Owner_Title",
      "Owner_Tenure_Yrs",
      "Owner_Email",
      "Owner_Phone",
      "Sources_Aggregated",
      "Duplicates_Merged",
      "Pipeline_Stage",
    ];

    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.companyName.replace(/"/g, '""')}"`,
      l.canonicalDomain,
      `"${l.industry}"`,
      l.naicsCode,
      `"${l.city}"`,
      l.state,
      l.foundedYear,
      l.yearsInBusiness,
      l.employeeCount,
      l.triangulation.triangulatedRevenue,
      l.triangulation.estimatedEbitda,
      l.triangulation.valuationLow,
      l.triangulation.valuationHigh,
      l.successionScore,
      `"${l.successionTier}"`,
      l.buyBoxScore,
      l.aiUpsideScore,
      `"${l.ownerName}"`,
      `"${l.ownerTitle}"`,
      l.ownerTenureYears,
      l.ownerEmail,
      `"${l.ownerPhone}"`,
      `"${l.sources.join(" | ")}"`,
      l.mergedDuplicateCount,
      l.pipelineStage,
    ]);

    const csvContent =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SaaSquatch_DealRadar_Qualified_Targets_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueIndustries = useMemo(() => {
    return Array.from(
      new Set(enrichedLeadsWithState.map((l) => l.industry))
    );
  }, [enrichedLeadsWithState]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f1c] via-[#111827] to-[#0a0f1c]">
      {/* Top SaaSquatch Header */}
      <header className="sticky top-0 z-40 bg-[#0a0f1c]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  SaaSquatch{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                    DealRadar™
                  </span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Caprae Search-as-a-Service Edition
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Off-Market M&A Buy-Box Screener • Multi-Source Deduplication •
                Succession Risk Engine
              </p>
            </div>
          </div>

          {/* View Switcher & Credit Counter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-[#131b2e] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveView("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === "table"
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                DealScreener
              </button>
              <button
                onClick={() => setActiveView("kanban")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === "kanban"
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                Pipeline Kanban
              </button>
              <button
                onClick={() => setActiveView("scraper")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === "scraper"
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Live Scraper Lab
              </button>
              <button
                onClick={() => setActiveView("analytics")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === "analytics"
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                NAICS Benchmarks
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131b2e] border border-teal-500/30 text-xs">
              <span className="text-gray-400">Credits:</span>
              <span className="font-bold text-white">{creditsRemaining}</span>
              <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold text-[10px]">
                +{pipeline.stats.creditsSaved} Saved via Dedup
              </span>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV ({filteredLeads.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Top KPI Metric Ribbon */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#131b2e]/90 border border-white/10 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Multi-Source Entity Resolution</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {pipeline.stats.uniqueCount} Golden Records
              </span>
              <span className="text-xs text-purple-300 font-semibold">
                from {pipeline.stats.totalRawCount} raw
              </span>
            </div>
            <div className="mt-1.5 text-[11px] text-teal-400 font-medium">
              ✔ {pipeline.stats.duplicatesRemoved} cross-source duplicates merged
              ({pipeline.stats.creditsSaved} credits saved)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#131b2e]/90 border border-teal-500/30 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Silver Tsunami / High Succession</span>
              <ShieldAlert className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-teal-400">
                {pipeline.stats.silverTsunamiCount} Targets
              </span>
              <span className="text-xs text-gray-400">Score ≥ 75/100</span>
            </div>
            <div className="mt-1.5 text-[11px] text-gray-300">
              Founders w/ 20–38 yrs tenure & no 2nd-tier heir
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#131b2e]/90 border border-blue-500/30 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Searcher Buy-Box Qualified</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-blue-400">
                {pipeline.stats.qualifiedCount} Companies
              </span>
              <span className="text-xs text-gray-400">
                of {pipeline.stats.uniqueCount} unique
              </span>
            </div>
            <div className="mt-1.5 text-[11px] text-gray-300">
              Auto-filtered out VC/PE-backed & out-of-band traps
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#131b2e]/90 border border-emerald-500/30 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Qualified Pipeline Enterprise Value</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-400">
                ${(pipeline.stats.aggregatePipelineEvUsd / 1e6).toFixed(1)}M
              </span>
              <span className="text-xs text-gray-400">Implied EV</span>
            </div>
            <div className="mt-1.5 text-[11px] text-gray-300">
              Triangulated via NAICS Headcount × EBITDA Multiples
            </div>
          </div>
        </section>

        {/* Searcher Buy-Box Thesis Selector & Filter Controls */}
        <section className="p-5 rounded-2xl bg-[#131b2e] border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Active Acquisition Searcher Buy-Box Thesis
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {BUY_BOX_PRESETS[activePresetKey]?.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(BUY_BOX_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    activePresetKey === key
                      ? "bg-teal-500/20 border-teal-400 text-teal-200 shadow-sm"
                      : "bg-[#0a0f1c] border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            {/* Search Box */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, founder, city, or legacy tech (e.g. WordPress, AS/400)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a0f1c] border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0a0f1c] border border-white/15 text-xs text-gray-200 focus:outline-none focus:border-teal-400"
              >
                <option value="ALL">All Target Industries ({uniqueIndustries.length})</option>
                {uniqueIndustries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Succession Score Slider */}
            <div className="bg-[#0a0f1c] px-3 py-1.5 rounded-xl border border-white/15">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Min Succession Score:</span>
                <span className="font-bold text-teal-400">
                  {criteria.minSuccessionScore} / 100
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={85}
                step={5}
                value={criteria.minSuccessionScore}
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    minSuccessionScore: Number(e.target.value),
                  }))
                }
                className="w-full accent-teal-400 h-1.5 mt-1 cursor-pointer"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                <input
                  type="checkbox"
                  checked={criteria.excludeVcPeBacked}
                  onChange={(e) =>
                    setCriteria((prev) => ({
                      ...prev,
                      excludeVcPeBacked: e.target.checked,
                    }))
                  }
                  className="accent-teal-500 rounded"
                />
                <span>Exclude VC / PE Traps</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                <input
                  type="checkbox"
                  checked={onlyQualified}
                  onChange={(e) => setOnlyQualified(e.target.checked)}
                  className="accent-teal-500 rounded"
                />
                <span>Strict Buy-Box Fit (≥75%)</span>
              </label>
            </div>
          </div>
        </section>

        {/* VIEW 1: DEALSCREENER TABLE */}
        {activeView === "table" && (
          <section className="rounded-2xl bg-[#131b2e] border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold text-white">
                  Deduplicated Off-Market Acquisition Targets ({filteredLeads.length}{" "}
                  shown)
                </h2>
              </div>
              <span className="text-xs text-gray-400">
                Click any target row to open its <b>60-Minute LBO Memo</b>,{" "}
                <b>NAICS Triangulation</b>, and{" "}
                <b>Founder Succession Letter</b>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0d1322] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-3.5 px-4">Company & Multi-Source Proof</th>
                    <th className="py-3.5 px-4">Founder & Tenure</th>
                    <th className="py-3.5 px-4">Succession Risk Index™</th>
                    <th className="py-3.5 px-4">
                      Triangulated Rev & Est. EBITDA
                    </th>
                    <th className="py-3.5 px-4">7-Yr AI Upside</th>
                    <th className="py-3.5 px-4">Buy-Box Fit</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="hover:bg-white/[0.04] transition cursor-pointer group"
                    >
                      {/* Company & Sources */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm group-hover:text-teal-300 transition">
                            {lead.companyName}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                          <span>
                            {lead.city}, {lead.state}
                          </span>
                          <span>•</span>
                          <span>
                            Est. {lead.foundedYear} ({lead.yearsInBusiness} yrs)
                          </span>
                          <span>•</span>
                          <span className="text-teal-300 font-medium">
                            {lead.employeeCount} FTEs
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          {lead.sources.map((src) => (
                            <span
                              key={src}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-white/5 text-gray-300 border border-white/10"
                            >
                              {src}
                            </span>
                          ))}
                          {lead.mergedDuplicateCount > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              +{lead.mergedDuplicateCount} Deduped
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Founder & Tenure */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-white">
                          {lead.ownerName}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {lead.ownerTitle}
                        </div>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[11px] font-medium">
                          <span>{lead.ownerTenureYears} yrs tenure</span>
                          <span>•</span>
                          <span>Est. Age ~{lead.estimatedOwnerAge}</span>
                        </div>
                        {!lead.hasSecondTierManagement && (
                          <div className="text-[10px] text-amber-300 mt-1">
                            ⚡ No 2nd-tier successor found
                          </div>
                        )}
                      </td>

                      {/* Succession Score */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-base font-extrabold ${
                              lead.successionScore >= 80
                                ? "text-teal-400"
                                : lead.successionScore >= 65
                                ? "text-blue-400"
                                : "text-rose-400"
                            }`}
                          >
                            {lead.successionScore}
                          </span>
                          <span className="text-[11px] text-gray-500">/100</span>
                        </div>
                        <div className="w-28 h-2 rounded-full bg-gray-800 overflow-hidden mt-1">
                          <div
                            className={`h-full ${
                              lead.successionScore >= 80
                                ? "bg-gradient-to-r from-teal-400 to-emerald-400"
                                : lead.successionScore >= 65
                                ? "bg-blue-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${lead.successionScore}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {lead.successionTier}
                        </div>
                      </td>

                      {/* Triangulated Financials */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-white text-sm">
                          $
                          {(
                            lead.triangulation.triangulatedRevenue / 1e6
                          ).toFixed(2)}
                          M{" "}
                          <span className="text-[10px] font-normal text-gray-400">
                            Rev
                          </span>
                        </div>
                        <div className="font-semibold text-emerald-400 mt-0.5">
                          $
                          {(lead.triangulation.estimatedEbitda / 1e6).toFixed(
                            2
                          )}
                          M{" "}
                          <span className="text-[10px] font-normal text-gray-400">
                            EBITDA ({lead.triangulation.benchmarkEbitdaMarginPct}
                            %)
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {lead.b2bRecurringPct}% B2B Recurring
                        </div>
                        {lead.triangulation.varianceWarning && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                            <AlertTriangle className="w-3 h-3" />
                            Growjo Spike Corrected
                          </div>
                        )}
                      </td>

                      {/* 7-Yr AI Upside */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-bold text-purple-300">
                            {lead.aiUpsideScore}/100
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 max-w-[160px] truncate">
                          {lead.techStack.slice(0, 2).join(", ")}
                        </div>
                        <div className="text-[10px] text-purple-300 mt-0.5">
                          Site updated {lead.websiteLastUpdatedYear}
                        </div>
                      </td>

                      {/* Buy-Box Fit */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            lead.buyBoxScore >= 85
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : lead.buyBoxScore >= 70
                              ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {lead.buyBoxScore >= 75 ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {lead.buyBoxScore}% Fit
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {lead.ownershipType}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-4 align-top text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold text-xs flex items-center gap-1 shadow transition"
                          >
                            <span>Inspect Dossier</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] flex items-center gap-1 transition"
                          >
                            <Mail className="w-3 h-3 text-teal-400" />
                            Founder Letter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* VIEW 2: ACQUISITION PIPELINE KANBAN */}
        {activeView === "kanban" && (
          <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STAGE_COLUMNS.map((col) => {
              const colLeads = filteredLeads.filter(
                (l) => l.pipelineStage === col.key
              );
              return (
                <div
                  key={col.key}
                  className="rounded-2xl bg-[#131b2e] border border-white/10 p-3.5 flex flex-col h-[640px]"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${col.badgeColor}`}
                    >
                      {col.title}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {colLeads.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="p-3.5 rounded-xl bg-[#0a0f1c] border border-white/10 hover:border-teal-500/40 cursor-pointer transition space-y-2 shadow"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-white leading-snug">
                            {lead.companyName}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold text-[10px] shrink-0">
                            {lead.successionScore}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {lead.city}, {lead.state} • {lead.ownerName} (
                          {lead.ownerTenureYears}y)
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                          <span className="text-emerald-400 font-semibold">
                            $
                            {(
                              lead.triangulation.estimatedEbitda / 1e6
                            ).toFixed(2)}
                            M EBITDA
                          </span>
                          <span className="text-blue-300">
                            {lead.buyBoxScore}% Fit
                          </span>
                        </div>
                        <div
                          className="pt-1 flex justify-between gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={lead.pipelineStage}
                            onChange={(e) =>
                              handleUpdateStage(
                                lead.id,
                                e.target.value as PipelineStage
                              )
                            }
                            className="w-full bg-[#131b2e] border border-white/10 rounded px-2 py-1 text-[10px] text-gray-300"
                          >
                            <option value="inbox">Move: Raw Inbox</option>
                            <option value="qualified">
                              Move: Buy-Box Qualified
                            </option>
                            <option value="outreach_sent">
                              Move: Outreach Sent
                            </option>
                            <option value="diligence">
                              Move: NDA / 60-Min LBO
                            </option>
                            <option value="passed">Move: Passed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* VIEW 3: LIVE SCRAPER & DEDUPLICATION LAB */}
        {activeView === "scraper" && (
          <LiveScraperLab
            onAddRawLeads={handleAddRawLeads}
            onInspectLead={(lead) => setSelectedLeadId(lead.id)}
          />
        )}

        {/* VIEW 4: NAICS BENCHMARKS & CAPRAE 7-YR AI ANALYTICS */}
        {activeView === "analytics" && (
          <section className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#131b2e] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    NAICS Industry Revenue & EBITDA Triangulation Benchmarks
                  </h3>
                  <p className="text-xs text-gray-400">
                    Replaces black-box scraper guesses with transparent lower-middle-market
                    operating multiples.
                  </p>
                </div>
                <FileSpreadsheet className="w-6 h-6 text-teal-400" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0a0f1c] border-b border-white/10 text-gray-400 uppercase text-[11px]">
                      <th className="py-3 px-4">NAICS Code</th>
                      <th className="py-3 px-4">Target ETA Sector</th>
                      <th className="py-3 px-4">Benchmark Rev / Employee</th>
                      <th className="py-3 px-4">Median EBITDA Margin</th>
                      <th className="py-3 px-4">Typical LMM EV Multiple</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {Object.entries(NAICS_BENCHMARKS).map(([code, b]) => (
                      <tr key={code} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-mono text-teal-300 font-bold">
                          {code}
                        </td>
                        <td className="py-3 px-4 text-white font-semibold">
                          {b.title}
                        </td>
                        <td className="py-3 px-4 text-gray-200">
                          ${(b.revPerEmployeeUsd / 1000).toFixed(0)}k / FTE
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">
                          {b.medianEbitdaMarginPct}%
                        </td>
                        <td className="py-3 px-4 text-blue-300 font-semibold">
                          {b.typicalMultipleLow.toFixed(1)}x –{" "}
                          {b.typicalMultipleHigh.toFixed(1)}x EBITDA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Slide-Over Dossier Drawer */}
      <LeadDossierDrawer
        lead={selectedLead}
        onClose={() => setSelectedLeadId(null)}
        onUpdateStage={handleUpdateStage}
        onUnlockCredit={handleUnlockCredit}
      />
    </div>
  );
}
