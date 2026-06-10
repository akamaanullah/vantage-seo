import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  Search, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  BarChart2, 
  Sliders, 
  Network,
  Download,
  Terminal,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from "lucide-react";

import { AuditReport, HistoryBenchmark } from "./types";
import MetricCard from "./components/MetricCard";
import ActionableFixes from "./components/ActionableFixes";
import CompetitorInsight from "./components/CompetitorInsight";
import KeywordTracker from "./components/KeywordTracker";
import SocialPreview from "./components/SocialPreview";
import HistoryBenchmarking from "./components/HistoryBenchmarking";

export default function App() {
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [competitorUrl, setCompetitorUrl] = useState("https://competitor.com");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "fixes" | "keywords" | "competitors" | "social" | "history">("overview");
  
  // Simulated fixed task IDs to dynamically recalculate dashboard scores!
  const [fixedSolutionIds, setFixedSolutionIds] = useState<string[]>([]);
  
  // Historical snapshots
  const [history, setHistory] = useState<HistoryBenchmark[]>([]);

  // On mount, load history and a sample audit report immediately so the user doesn't see a blank page!
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("seo_audit_benchmarks");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }

      const activeRep = localStorage.getItem("seo_active_report");
      if (activeRep) {
        setReport(JSON.parse(activeRep));
      } else {
        // Trigger a quick initial mock scan so the user arrives at a pre-rendered, fully working dashboard!
        triggerInitialDemo();
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const triggerInitialDemo = async () => {
    setLoading(true);
    setLoadingStep("Pre-loading standard benchmark dataset...");
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com", competitorUrl: "https://competitor.com" })
      });
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
        localStorage.setItem("seo_active_report", JSON.stringify(data.report));
        
        // Hydrate initial history as well if empty
        const initialHistory: HistoryBenchmark[] = [
          { timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), performanceScore: 68, seoScore: 75, accessibilityScore: 78 },
          { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), performanceScore: 72, seoScore: 77, accessibilityScore: 80 },
          { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), performanceScore: data.report.performance.score, seoScore: data.report.seo.score, accessibilityScore: data.report.accessibility.score }
        ];
        setHistory(initialHistory);
        localStorage.setItem("seo_audit_benchmarks", JSON.stringify(initialHistory));
        if (data.warning) {
          setWarning(data.warning);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Perform full-stack audit
  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setWarning(null);
    setFixedSolutionIds([]); // clean simulated fixes for new URL

    // Beautiful sequential progress loop representing live crawler states
    const steps = [
      "Establishing connection to target web socket...",
      "Crawling on-page HTML headers and meta tags...",
      "Sieving technical robots.txt, sitemaps, and HTTPS protocols...",
      "Simulating PageSpeed Core Web Vitals (FCP, LCP, TBT, CLS)...",
      "Performing WCAG contrast-ratio and ARIA landmark compliance scans...",
      "Scraping social shareability protocols and OpenGraph schemas...",
      "Running semantic business niche competitor comparisons...",
      "Curating search traffic keyword volume clusters...",
      "Writing responsive developer code implementations and recommendations..."
    ];

    let currentStep = 0;
    setLoadingStep(steps[0]);

    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingStep(steps[currentStep]);
      }
    }, 1100);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, competitorUrl: competitorUrl })
      });
      
      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to complete audit request on server.");
      }

      const data = await res.json();
      if (!data.report) {
         throw new Error("Audit report could not be successfully generated.");
      }

      setReport(data.report);
      localStorage.setItem("seo_active_report", JSON.stringify(data.report));

      // Append to local storage history tracker
      const newHistoryEntry: HistoryBenchmark = {
        timestamp: new Date().toISOString(),
        performanceScore: data.report.performance.score,
        seoScore: data.report.seo.score,
        accessibilityScore: data.report.accessibility.score
      };
      
      const newHistory = [newHistoryEntry, ...history].slice(0, 15); // keep last 15 audits
      setHistory(newHistory);
      localStorage.setItem("seo_audit_benchmarks", JSON.stringify(newHistory));

      if (data.warning) {
        setWarning(data.warning);
      }

      setTab("overview"); // reset to primary tab
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "Something went wrong fetching from our backend crawler.");
    } finally {
      setLoading(false);
    }
  };

  // Automated simulated score recalculation!
  const handleToggleSimulatedFix = (solId: string) => {
    if (fixedSolutionIds.includes(solId)) {
      setFixedSolutionIds(fixedSolutionIds.filter(id => id !== solId));
    } else {
      setFixedSolutionIds([...fixedSolutionIds, solId]);
    }
  };

  // Clear history benchmark logs
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("seo_audit_benchmarks");
  };

  // Re-load snapshot from historical list
  const handleApplySnapshot = (index: number) => {
    // In a real application, we would store complete reports. For this, we'll simulate the snapshot update or run a new search
    const snapshot = history[index];
    if (report) {
      // Temporarily mock scores in active report to reflect snapshot details
      const updatedReport = {
        ...report,
        timestamp: snapshot.timestamp,
        performance: { ...report.performance, score: snapshot.performanceScore },
        seo: { ...report.seo, score: snapshot.seoScore },
        accessibility: { ...report.accessibility, score: snapshot.accessibilityScore }
      };
      setReport(updatedReport);
      setFixedSolutionIds([]);
    }
  };

  // Core scores recalculation logic representing fixes
  // Every performance fix adds +5, SEO +6, Accessibility +6 to a max of 100
  const getDynamicScores = () => {
    if (!report) return { perf: 0, seo: 0, access: 0, social: 0 };
    
    let perfBonus = 0;
    let seoBonus = 0;
    let accessBonus = 0;
    let socialBonus = 0;

    fixedSolutionIds.forEach((id) => {
      const sol = report.solutions.find(s => s.id === id);
      if (sol) {
        if (sol.category === "performance") perfBonus += 5;
        if (sol.category === "seo") seoBonus += 6;
        if (sol.category === "accessibility") accessBonus += 6;
        if (sol.category === "social") socialBonus += 5;
      }
    });

    return {
      perf: Math.min(100, report.performance.score + perfBonus),
      seo: Math.min(100, report.seo.score + seoBonus),
      access: Math.min(100, report.accessibility.score + accessBonus),
      social: Math.min(100, report.socialShareability.score + socialBonus)
    };
  };

  const dynamic = getDynamicScores();
  const host = report?.url.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0] || "Target Website";

  // Clean printable overview export trigger
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-400 flex flex-col lg:flex-row font-sans selection:bg-emerald-500/20 selection:text-white leading-normal">
      
      {/* 1. BRAND SIDEBAR (Desktop layout) */}
      <aside className="w-72 border-r border-white/5 bg-[#0d0d0d] flex flex-col p-6 min-h-screen shrink-0 hidden lg:flex">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-10 px-2 mt-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
          </div>
          <span className="text-white font-semibold tracking-tight text-lg font-sans">
            VANTAGE <span className="font-light opacity-60 text-slate-400">SEO</span>
          </span>
        </div>

        {/* Premium Sidebar Navigation Menu */}
        <nav className="space-y-1.5 flex-1 select-none">
          <button
            onClick={() => setTab("overview")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 border rounded-xl text-left text-xs font-semibold tracking-wide transition-all ${
              tab === "overview"
                ? "bg-white/5 text-white border-white/10 shadow-md"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <FileText size={16} className={tab === "overview" ? "text-emerald-400" : ""} />
            Overview Audits
          </button>

          <button
            onClick={() => setTab("fixes")}
            className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left text-xs font-semibold tracking-wide transition-all ${
              tab === "fixes"
                ? "bg-white/5 text-white border-white/10 shadow-md"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <span className="flex items-center gap-3.5">
              <Sliders size={16} className={tab === "fixes" ? "text-emerald-400" : ""} />
              Technical & Code Fixes
            </span>
            {report && report.solutions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 font-mono font-bold tracking-tight">
                {report.solutions.length - fixedSolutionIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("keywords")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 border rounded-xl text-left text-xs font-semibold tracking-wide transition-all ${
              tab === "keywords"
                ? "bg-white/5 text-white border-white/10 shadow-md"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Search size={16} className={tab === "keywords" ? "text-emerald-400" : ""} />
            Keywords suggestions
          </button>

          <button
            onClick={() => setTab("competitors")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 border rounded-xl text-left text-xs font-semibold tracking-wide transition-all ${
              tab === "competitors"
                ? "bg-white/5 text-white border-white/10 shadow-md"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <BarChart2 size={16} className={tab === "competitors" ? "text-emerald-400" : ""} />
            Competitors analysis
          </button>

          <button
            onClick={() => setTab("social")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 border rounded-xl text-left text-xs font-semibold tracking-wide transition-all ${
              tab === "social"
                ? "bg-white/5 text-white border-white/10 shadow-md"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Network size={16} className={tab === "social" ? "text-emerald-400" : ""} />
            Social Card Previews
          </button>

          <button
            onClick={() => setTab("history")}
            className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left text-xs font-semibold tracking-wide transition-all ${
              tab === "history"
                ? "bg-white/5 text-white border-white/10 shadow-md"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <span className="flex items-center gap-3.5">
              <Clock size={16} className={tab === "history" ? "text-emerald-400" : ""} />
              Timeline History
            </span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-white/10 text-slate-300 font-mono tracking-tight font-bold">
                {history.length}
              </span>
            )}
          </button>
        </nav>

        {/* Weekly Domain Gain Static Visualizer */}
        <div className="mt-auto p-4 bg-white/[0.02] rounded-2xl border border-white/5 font-sans">
          <p className="text-[10px] uppercase tracking-widest text-[#555] mb-2.5 font-bold">Weekly Domain Gain</p>
          <div className="flex items-end gap-1.5 h-8 select-none">
            <div className="flex-1 bg-white/5 rounded h-[40%] transition-all"></div>
            <div className="flex-1 bg-white/5 rounded h-[60%] transition-all"></div>
            <div className="flex-1 bg-emerald-500/20 rounded h-[90%] transition-all shadow-[0_0_8px_rgba(16,185,129,0.2)]"></div>
            <div className="flex-1 bg-white/5 rounded h-[50%] transition-all"></div>
            <div className="flex-1 bg-emerald-500/40 rounded h-[75%] transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"></div>
          </div>
          <div className="mt-3.5 flex justify-between items-center text-xs font-sans">
            <span className="text-white font-medium">+12.4% Score</span>
            <span className="text-emerald-400 text-[10px] font-mono font-bold tracking-wider">▲ ACTIVE</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN VIEW AREA (Carries header, inputs, dynamic panels) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] min-h-screen">
        
        {/* Upper sticky menu */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            
            {/* Mobile Header Brand Element (visible under lg screen) */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center text-white">
                <Zap size={14} className="text-emerald-400" />
              </span>
              <div>
                <h1 className="font-sans font-bold text-xs tracking-tight text-white leading-tight">
                  VANTAGE <span className="font-light opacity-60 text-slate-400">SEO</span>
                </h1>
              </div>
            </div>

            {/* Desktop Node Indicator */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono tracking-wide">SYSTEM OVERWATCH NODE ACTIVE</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            </div>

            <div className="flex items-center gap-4">
              {report && (
                <button
                  onClick={handlePrintReport}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-sans font-semibold hover:bg-white/5 border border-white/10 rounded-xl text-slate-200 transition-all cursor-pointer bg-white/5 active:scale-95"
                >
                  <Download size={12} />
                  Export printable PDF
                </button>
              )}
              
              <div className="hidden sm:flex flex-col text-right text-[10px] text-slate-500 font-mono leading-none">
                <span>AUDIT TIMESTAMP</span>
                <span className="text-slate-300 font-semibold mt-0.5 uppercase tracking-wide">
                  {report ? new Date(report.timestamp).toLocaleDateString() : "Pending scan"}
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Warn message if Sandbox Mode */}
        {warning && (
          <div className="bg-amber-500/5 text-amber-300 border-b border-amber-500/10 px-6 py-3.5 text-xs font-sans leading-relaxed">
            <div className="max-w-7xl mx-auto flex items-start gap-2.5">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-500" />
              <span>{warning}</span>
            </div>
          </div>
        )}

        {/* Primary Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
          
          {/* Headline Display Text */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">CRAWLER CONTROL</span>
            <h1 className="text-3xl font-serif font-semibold text-white tracking-tight">Website Performance & Compliance</h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">Analyze Core Vitals speed indexes, structural index tags, off-page benchmarks, and automatic search competitiveness.</p>
          </div>

          {/* URL Inputs panel card */}
          <section className="bg-[#121212] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-1.5">
              <h2 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider">Configure Site Target Data</h2>
              <p className="text-xs text-slate-500">Provide any target domain alongside an optional competitor to discover metrics gaps and technical opportunities.</p>
            </div>

            <form onSubmit={handleRunAudit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
              <div className="lg:col-span-6 space-y-2">
                <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold tracking-wider">Webpage Address (URL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <Globe size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://www.luxe-travel.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full pl-11 pr-5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#151515] text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-sans font-medium placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-2">
                <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold tracking-wider">Competitor Address (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <ExternalLink size={15} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. competitor.com"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    className="w-full pl-11 pr-5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#151515] text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-sans font-medium placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-xl font-sans font-bold text-xs text-white bg-emerald-600 border border-emerald-700/50 hover:bg-emerald-500 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block shrink-0" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Search size={14} className="stroke-[2.5px]" />
                      <span>Analyze Site</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message block */}
            {error && (
              <div className="flex gap-3 bg-rose-950/10 border border-rose-900/40 p-4 rounded-xl text-xs text-red-400 leading-normal">
                <XCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                <div>
                  <span className="font-bold block font-sans text-red-200">Execution Blocked</span>
                  <p className="font-sans mt-1 text-slate-400">{error}</p>
                </div>
              </div>
            )}
          </section>

          {/* CRAWL PROCESS LOADER SECTION */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#121212] border border-white/5 text-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-xl select-none min-h-[260px]"
              >
                <div className="w-14 h-14 rounded-full border-4 border-white/5 border-t-emerald-400 animate-spin flex items-center justify-center">
                  <Terminal size={20} className="text-slate-500 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 animate-pulse block">Crawling & Scraping Metrics Database</span>
                  <h3 className="font-serif font-medium text-base text-white max-w-md">
                    {loadingStep}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Standby for multi-engine indexing sequence. Usually takes about 10 seconds.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        {/* AUDIT DETAILS SCREEN */}
        {report && !loading && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header domain detail summaries */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500 font-sans text-xs">Currently evaluating domain:</span>
                  <a 
                    href={report.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-mono text-white hover:text-emerald-400 flex items-center gap-1 font-semibold text-sm underline decoration-emerald-500/30 hover:decoration-emerald-400 transition-all"
                  >
                    {host}
                    <ExternalLink size={12} className="text-slate-500" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 font-sans mt-1">Audit Session snapshot loaded successfully. Explore individual tabs for structural resolutions and opportunities.</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <span className="px-3 py-1.5 rounded-xl border border-white/5 bg-[#121212] text-[10px] font-mono text-slate-400">
                  Size: {report.performance.pageSizeKb} KB
                </span>
                <span className="px-3 py-1.5 rounded-xl border border-white/5 bg-[#121212] text-[10px] font-mono text-slate-400">
                  Requests: {report.performance.requestCount}
                </span>
                <span className="px-3 py-1.5 rounded-xl border border-white/5 bg-[#121212] text-[10px] font-mono text-slate-400">
                  HTTP Mode: {report.seo.technical.isHttps ? 'HTTPS Sec (SSL)' : 'HTTP Non-Secure'}
                </span>
              </div>
            </div>

            {/* Metric score gauges card grid */}
            <div id="metrics-card-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard
                id="perf"
                title="Performance Score"
                score={dynamic.perf}
                color={dynamic.perf >= 90 ? 'emerald' : dynamic.perf >= 70 ? 'amber' : 'rose'}
                icon={Zap}
                description="Core Page Speed metrics, First paints, loading indexes, and total blocking latency."
                isActive={tab === "overview" || tab === "fixes"}
                onClick={() => setTab("overview")}
              />
              <MetricCard
                id="seo"
                title="SEO Compliance"
                score={dynamic.seo}
                color={dynamic.seo >= 90 ? 'emerald' : dynamic.seo >= 70 ? 'amber' : 'rose'}
                icon={Globe}
                description="On-page title setups, heading hierarchies, crawler indexing parameters, and Off-page setups."
                isActive={tab === "overview" || tab === "keywords"}
                onClick={() => setTab("overview")}
              />
              <MetricCard
                id="access"
                title="WCAG Access"
                score={dynamic.access}
                color={dynamic.access >= 90 ? 'emerald' : dynamic.access >= 70 ? 'amber' : 'rose'}
                icon={Sliders}
                description="WCAG contrast rules, landmark sections, form accessibility descriptors, and screen reader cues."
                isActive={tab === "overview"}
                onClick={() => setTab("overview")}
              />
              <MetricCard
                id="social"
                title="Social Shareability"
                score={dynamic.social}
                color={dynamic.social >= 90 ? 'emerald' : dynamic.social >= 70 ? 'amber' : 'rose'}
                icon={Network}
                description="OpenGraph properties readiness check, Twitter card bindings, and direct slack visual renders."
                isActive={tab === "social"}
                onClick={() => setTab("social")}
              />
            </div>

            {/* Mobile Tab bar - visible only under lg screen */}
            <div className="lg:hidden border-b border-white/5 flex items-center overflow-x-auto scrollbar-none gap-2">
              <button
                onClick={() => setTab("overview")}
                className={`flex items-center gap-1.5 px-4 py-3 bg-transparent border-b-2 text-xs font-sans font-semibold transition-all shrink-0 ${
                  tab === "overview"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <FileText size={14} />
                Overview Audits
              </button>

              <button
                onClick={() => setTab("fixes")}
                className={`flex items-center gap-1.5 px-4 py-3 bg-transparent border-b-2 text-xs font-sans font-semibold transition-all shrink-0 relative ${
                  tab === "fixes"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Sliders size={14} />
                Fixes
                {report.solutions.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 font-mono">
                    {report.solutions.length - fixedSolutionIds.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab("keywords")}
                className={`flex items-center gap-1.5 px-4 py-3 bg-transparent border-b-2 text-xs font-sans font-semibold transition-all shrink-0 ${
                  tab === "keywords"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Search size={14} />
                Keywords
              </button>

              <button
                onClick={() => setTab("competitors")}
                className={`flex items-center gap-1.5 px-4 py-3 bg-transparent border-b-2 text-xs font-sans font-semibold transition-all shrink-0 ${
                  tab === "competitors"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <BarChart2 size={14} />
                Compare
              </button>

              <button
                onClick={() => setTab("social")}
                className={`flex items-center gap-1.5 px-4 py-3 bg-transparent border-b-2 text-xs font-sans font-semibold transition-all shrink-0 ${
                  tab === "social"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Network size={14} />
                Social Card
              </button>

              <button
                onClick={() => setTab("history")}
                className={`flex items-center gap-1.5 px-4 py-3 bg-transparent border-b-2 text-xs font-sans font-semibold transition-all shrink-0 ${
                  tab === "history"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Clock size={14} />
                Timeline
              </button>
            </div>

            {/* Tab screen renders */}
            <section className="bg-[#121212] border border-white/5 p-6 sm:p-8 rounded-3xl min-h-[400px]">
              
              {/* TAB 1: OVERVIEW SCREEN */}
              {tab === "overview" && (
                <div id="overview-tab-view" className="space-y-8 animate-fade-in text-xs">
                  
                  {/* Performance Load Times & Vitals grids */}
                  <div className="space-y-4">
                    <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Google Web Vital Load Milestones</span>
                      <span className="text-[10px] text-slate-500 font-mono normal-case">Target values to evaluate page experience</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* FCP */}
                      <div className="bg-[#0e0e0e] p-5 rounded-2xl border border-white/5 space-y-1.5 hover:border-white/10 transition-all">
                        <span className="text-slate-500 font-sans block text-[11px] font-medium">{report.performance.fcp.label}</span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-2xl font-bold text-white tracking-tight">{report.performance.fcp.value}s</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wide uppercase font-mono ${
                            report.performance.fcp.rating === "good" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                          }`}>
                            {report.performance.fcp.rating}
                          </span>
                        </div>
                      </div>

                      {/* LCP */}
                      <div className="bg-[#0e0e0e] p-5 rounded-2xl border border-white/5 space-y-1.5 hover:border-white/10 transition-all">
                        <span className="text-slate-500 font-sans block text-[11px] font-medium">{report.performance.lcp.label}</span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-2xl font-bold text-white tracking-tight">{report.performance.lcp.value}s</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wide uppercase font-mono ${
                            report.performance.lcp.rating === "good" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                          }`}>
                            {report.performance.lcp.rating}
                          </span>
                        </div>
                      </div>

                      {/* CLS */}
                      <div className="bg-[#0e0e0e] p-5 rounded-2xl border border-white/5 space-y-1.5 hover:border-white/10 transition-all">
                        <span className="text-slate-500 font-sans block text-[11px] font-medium">{report.performance.cls.label}</span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-2xl font-bold text-white tracking-tight">{report.performance.cls.value}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wide uppercase font-mono ${
                            report.performance.cls.rating === "good" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                          }`}>
                            {report.performance.cls.rating}
                          </span>
                        </div>
                      </div>

                      {/* TBT */}
                      <div className="bg-[#0e0e0e] p-5 rounded-2xl border border-white/5 space-y-1.5 hover:border-white/10 transition-all">
                        <span className="text-slate-500 font-sans block text-[11px] font-medium">{report.performance.tbt.label}</span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-2xl font-bold text-white tracking-tight">{report.performance.tbt.value}ms</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wide uppercase font-mono ${
                            report.performance.tbt.rating === "good" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                          }`}>
                            {report.performance.tbt.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* On-Page & Technical SEO details columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* On-Page SEO details block */}
                    <div className="space-y-4">
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-300 font-bold">On-Page Header Content Structures</h4>
                      
                      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5 space-y-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Header Meta Title</span>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold font-mono uppercase ${
                              report.seo.onPage.titleStatus === "good" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
                            }`}>{report.seo.onPage.titleStatus} ({report.seo.onPage.titleLength} Chars)</span>
                          </div>
                          <span className="font-sans font-semibold text-xs text-white block bg-[#121212] p-3 rounded-xl border border-white/5">
                            {report.seo.onPage.title}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-[#666] tracking-wider">Meta Description</span>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold font-mono uppercase ${
                              report.seo.onPage.descriptionStatus === "good" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
                            }`}>{report.seo.onPage.descriptionStatus} ({report.seo.onPage.descriptionLength} Chars)</span>
                          </div>
                          <p className="text-slate-400 bg-[#121212] p-3 rounded-xl border border-white/5 leading-relaxed">
                            {report.seo.onPage.metaDescription || "No meta description declared. Search engines will fallback to scrap body snippets instead."}
                          </p>
                        </div>

                        {/* Headings Hierarchy Checklist */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono uppercase text-[#666] block pb-1 border-b border-white/5 tracking-wider">Heading Tag Outline</span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {report.seo.onPage.headingsStructure.map((head, i) => (
                              <div key={i} className="font-mono text-[10px] text-slate-400 flex items-center gap-2 py-1 pl-2.5 bg-white/[0.01] border-l-2 border-emerald-500/40 rounded-r">
                                <span>{head}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Heading H1 Checkmark:</span>
                          <span className={`font-semibold text-xs ${report.seo.onPage.h1Presence ? "text-emerald-400" : "text-rose-400"}`}>
                            {report.seo.onPage.h1Presence ? "✔ Single Active H1 Tag present" : "✘ Missing H1 primary index factor"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Technical and offpage detail checklist list */}
                    <div className="space-y-4">
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-300 font-bold">Technical & Off-Page Crawlers Validations</h4>
                      
                      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5 space-y-5 shadow-inner">
                        
                        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/5">
                          <div className="flex flex-col gap-0.5 bg-[#121212] p-3 rounded-xl border border-white/5">
                            <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">Domain Authority</span>
                            <span className="text-xl font-bold text-white">{report.seo.offPage.domainAuthority} <strong className="text-[11px] text-slate-500 font-semibold font-mono">/ 100</strong></span>
                          </div>
                          <div className="flex flex-col gap-0.5 bg-[#121212] p-3 rounded-xl border border-white/5">
                            <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">Organic Keywords</span>
                            <span className="text-xl font-bold text-white">{report.seo.offPage.rankingKeywordsCount.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-3 font-sans">
                          <div className="flex justify-between items-center text-xs py-0.5">
                            <span className="text-slate-500 flex items-center gap-1">HTTPS Encryption Security check:</span>
                            <span className={`font-mono text-xs font-bold uppercase ${report.seo.technical.isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {report.seo.technical.isHttps ? 'SECURE ✔' : 'UNSECURE ✘'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs py-0.5">
                            <span className="text-slate-500">XML Indexing Sitemap checklist:</span>
                            <span className={`font-mono text-xs font-bold uppercase ${report.seo.technical.sitemapFound ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {report.seo.technical.sitemapFound ? 'Sitemap found' : 'Warning: Not found'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs py-0.5">
                            <span className="text-slate-500">robots.txt instructions index check:</span>
                            <span className={`font-mono text-xs font-bold uppercase ${report.seo.technical.robotsTxtFound ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {report.seo.technical.robotsTxtFound ? 'Robots found' : 'Warning: Not found'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs py-0.5">
                            <span className="text-slate-500">GZIP / Brotli payload compression flags:</span>
                            <span className={`font-mono text-xs font-bold uppercase ${report.seo.technical.compressionEnabled ? 'text-emerald-400' : 'text-amber-404'}`}>
                              {report.seo.technical.compressionEnabled ? 'Active ✔' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        {/* Local Schema optimizations recommendations */}
                        <div className="space-y-1.5 bg-[#151515] p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">Local SEO markup targets</span>
                          <span className="font-semibold text-white block">Schema Category: {report.seo.local.schemaOrgType}</span>
                          <ul className="list-disc pl-4 space-y-1 mt-2 text-[11px] text-slate-400 leading-relaxed">
                            {report.seo.local.recommendations.map((rec, k) => (
                              <li key={k}>{rec}</li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Accessibility audit checklist panels */}
                  <div className="space-y-4">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-300 font-bold">WCAG Accessibility Compliance Audits</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {report.accessibility.checks.map((check) => (
                        <div key={check.id} className="p-4 rounded-2xl border border-white/5 bg-[#0d0d0d] flex gap-3.5 hover:border-white/10 transition-all">
                          <span className="shrink-0 mt-0.5">
                            {check.status === "pass" ? (
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            ) : check.status === "warning" ? (
                              <AlertTriangle size={16} className="text-amber-400" />
                            ) : (
                              <XCircle size={16} className="text-rose-400" />
                            )}
                          </span>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white">{check.item}</span>
                              <span className={`font-mono text-[8px] tracking-wide uppercase px-1.5 py-0.5 border border-white/10 rounded-lg bg-white/5 text-slate-400`}>
                                Impact {check.impact}
                              </span>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-[11px]">{check.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: SOLUTIONS AND SOLUTIONS ACCORDION LIST */}
              {tab === "fixes" && (
                <ActionableFixes
                  solutions={report.solutions}
                  onToggleSimulatedFix={handleToggleSimulatedFix}
                  fixedSolutionIds={fixedSolutionIds}
                />
              )}

              {/* TAB 3: KEYWORDS SUGGESTION ENGINE */}
              {tab === "keywords" && (
                <KeywordTracker
                  suggestions={report.keywords}
                  url={report.url}
                />
              )}

              {/* TAB 4: COMPETITOR COMPARE GAPS */}
              {tab === "competitors" && (
                <CompetitorInsight
                  comparison={report.competitorComparison}
                />
              )}

              {/* TAB 5: SOCIAL CARD GRAPHICS PREVIEWS */}
              {tab === "social" && (
                <SocialPreview
                  social={report.socialShareability}
                  url={report.url}
                />
              )}

              {/* TAB 6: TIMELINE LOG HISTORY AND Automated BENCHMARK CURVE */}
              {tab === "history" && (
                <HistoryBenchmarking
                  history={history}
                  onClearHistory={handleClearHistory}
                  onApplySnapshot={handleApplySnapshot}
                  hostName={host}
                />
              )}

            </section>
          </div>
        )}

      </main>

      {/* Footer system attributes */}
      <footer className="border-t border-white/5 bg-[#0d0d0d] mt-12 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px] tracking-widest uppercase">
          <div>
            <span>WEBSITE PERFORMANCE & SEO AUDITOR SNAPSHOT REPORT</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Server-side rendering enabled ⚡</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
  );
}
