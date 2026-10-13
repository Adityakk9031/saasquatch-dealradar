"use client";

import React, { useState } from "react";
import { EnrichedLead, RawLeadRecord } from "@/types/leads";
import {
  Globe,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  PlusCircle,
  Loader2,
} from "lucide-react";

interface LiveScraperLabProps {
  onAddRawLeads: (newRawRecords: RawLeadRecord[]) => void;
  onInspectLead: (lead: EnrichedLead) => void;
}

export default function LiveScraperLab({
  onAddRawLeads,
  onInspectLead,
}: LiveScraperLabProps) {
  const [domain, setDomain] = useState("ohiocriticalpower.com");
  const [companyName, setCompanyName] = useState("Ohio Critical Power Systems");
  const [industry, setIndustry] = useState(
    "Data Center & Critical Infrastructure"
  );
  const [city, setCity] = useState("Cleveland");
  const [state, setState] = useState("OH");
  const [foundedYear, setFoundedYear] = useState(1995);
  const [employeeCount, setEmployeeCount] = useState(35);
  const [ownerName, setOwnerName] = useState("hector.vance");
  const [ownerFullName, setOwnerFullName] = useState("Hector Vance");
  const [loading, setLoading] = useState(false);

  const [lastResult, setLastResult] = useState<{
    liveFetchStatus: string;
    rawMultiSourceRecords: RawLeadRecord[];
    goldenRecord: EnrichedLead;
  } | null>(null);

  const handleRunLiveScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          companyName,
          industry,
          city,
          state,
          foundedYear,
          employeeCount,
          ownerName: ownerFullName || ownerName,
        }),
      });
      const data = await res.json();
      if (data.goldenRecord) {
        setLastResult(data);
        onAddRawLeads(data.rawMultiSourceRecords);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#131b2e] border border-teal-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Live Multi-Source Ingestion & Deduplication Engine
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              Real-Time Domain Scanner & Golden Record Resolver
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Enter any target company domain. Our engine scans live HTML tech-debt
              signals, aggregates records across Apollo, Google Maps & Growjo,
              suppresses duplicates, and triangulates NAICS EBITDA.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleRunLiveScrape}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">
              Target Domain / URL
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1c] border border-white/15 text-sm text-white focus:outline-none focus:border-teal-400"
              placeholder="e.g. apexcriticalpower.com"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1c] border border-white/15 text-sm text-white focus:outline-none focus:border-teal-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">
              Target ETA Sector (NAICS)
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1c] border border-white/15 text-sm text-white focus:outline-none focus:border-teal-400"
            >
              <option value="Data Center & Critical Infrastructure">
                Data Center & Critical Infrastructure (811212)
              </option>
              <option value="Managed IT & MSP">
                Managed IT & MSP Services (541512)
              </option>
              <option value="Commercial HVAC & Mechanical">
                Commercial HVAC & Mechanical (238220)
              </option>
              <option value="Industrial Testing & Compliance">
                Industrial Testing & Compliance (541380)
              </option>
              <option value="Specialized B2B Logistics">
                Specialized B2B Logistics (488510)
              </option>
              <option value="Precision Manufacturing">
                Precision Manufacturing (332710)
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">
              Founder / Principal Name
            </label>
            <input
              type="text"
              value={ownerFullName}
              onChange={(e) => {
                setOwnerFullName(e.target.value);
                setOwnerName(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1c] border border-white/15 text-sm text-white focus:outline-none focus:border-teal-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">
              Founded Year (Age Signal)
            </label>
            <input
              type="number"
              min={1950}
              max={2026}
              value={foundedYear}
              onChange={(e) => setFoundedYear(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1c] border border-white/15 text-sm text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">
              Employee Headcount (FTEs)
            </label>
            <input
              type="number"
              min={3}
              max={500}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1c] border border-white/15 text-sm text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0f1c] border border-white/15 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0f1c] border border-white/15 text-sm text-white"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning & Deduplicating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Scrape, Deduplicate & Score
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Output Visualization */}
      {lastResult && (
        <div className="p-6 rounded-2xl bg-[#131b2e] border border-white/10 space-y-6 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <span className="font-bold text-white text-sm">
                Pipeline Execution Complete: 3 Raw Multi-Source Records Merged into 1
                Golden Record (+2 Credits Saved)
              </span>
            </div>
            <span className="text-xs text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              {lastResult.liveFetchStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
            {/* 3 Raw Conflicting Inputs */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase text-gray-400">
                Step 1: Raw Scraped Sources (Noisy & Duplicated)
              </div>
              {lastResult.rawMultiSourceRecords.map((raw, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#0a0f1c] border border-white/10 text-xs space-y-1"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-purple-300">
                      [{raw.source}] {raw.companyName}
                    </span>
                    <span className="text-gray-500 font-mono">{raw.website}</span>
                  </div>
                  <div className="text-gray-300 flex justify-between">
                    <span>Email: {raw.ownerEmail}</span>
                    <span>Phone: {raw.ownerPhone}</span>
                  </div>
                  {raw.reportedRevenueUsd && (
                    <div className="text-amber-300">
                      Raw Reported Revenue: $
                      {(raw.reportedRevenueUsd / 1e6).toFixed(2)}M
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center text-teal-400 py-2">
              <Layers className="w-6 h-6 mb-1" />
              <ArrowRight className="w-6 h-6 hidden lg:block" />
              <span className="text-[10px] uppercase font-bold text-center mt-1">
                Entity Resolution
              </span>
            </div>

            {/* Golden Record Output */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-[#162238] to-[#0f172a] border-2 border-teal-500/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  GOLDEN RECORD ADDED TO PIPELINE
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  Buy-Box Match: {lastResult.goldenRecord.buyBoxScore}%
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {lastResult.goldenRecord.companyName}
                </h3>
                <p className="text-xs text-gray-400">
                  Canonical Domain:{" "}
                  <b className="text-teal-300">
                    {lastResult.goldenRecord.canonicalDomain}
                  </b>{" "}
                  • Surviving Email:{" "}
                  <b className="text-white">
                    {lastResult.goldenRecord.ownerEmail}
                  </b>{" "}
                  (Filtered out generic info@)
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#0a0f1c] border border-white/10">
                  <div className="text-[10px] text-gray-400">
                    Succession Risk
                  </div>
                  <div className="text-lg font-extrabold text-teal-400">
                    {lastResult.goldenRecord.successionScore}/100
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0a0f1c] border border-white/10">
                  <div className="text-[10px] text-gray-400">
                    Triangulated Rev
                  </div>
                  <div className="text-lg font-extrabold text-white">
                    $
                    {(
                      lastResult.goldenRecord.triangulation
                        .triangulatedRevenue / 1e6
                    ).toFixed(2)}
                    M
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0a0f1c] border border-white/10">
                  <div className="text-[10px] text-gray-400">Est. EBITDA</div>
                  <div className="text-lg font-extrabold text-emerald-400">
                    $
                    {(
                      lastResult.goldenRecord.triangulation.estimatedEbitda /
                      1e6
                    ).toFixed(2)}
                    M
                  </div>
                </div>
              </div>

              {lastResult.goldenRecord.triangulation.varianceWarning && (
                <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lastResult.goldenRecord.triangulation.varianceWarning}
                  </span>
                </div>
              )}

              <button
                onClick={() => onInspectLead(lastResult.goldenRecord)}
                className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Open Full M&A Dossier, Outreach & 60-Min LBO Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
