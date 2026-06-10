import { useState } from "react";
import { ActionableSolution } from "../types";
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ShieldAlert, 
  CornerDownRight, 
  Wrench,
  Search,
  CheckCircle2,
  ListFilter
} from "lucide-react";

interface ActionableFixesProps {
  solutions: ActionableSolution[];
  onToggleSimulatedFix: (solutionId: string) => void;
  fixedSolutionIds: string[];
}

export default function ActionableFixes({
  solutions,
  onToggleSimulatedFix,
  fixedSolutionIds
}: ActionableFixesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(solutions[0]?.id || null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Fixes" },
    { id: "performance", label: "Speed & Vitals" },
    { id: "seo", label: "SEO Audits" },
    { id: "accessibility", label: "Accessibility" },
    { id: "social", label: "Social Index" }
  ];

  const handleCopyCode = async (solutionId: string, snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(solutionId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityBadgeColor = (prio: number) => {
    switch (prio) {
      case 1: return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/25 dark:text-rose-400 dark:border-rose-900/40";
      case 2: return "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/25 dark:text-orange-400 dark:border-orange-900/40";
      case 3: return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/25 dark:text-amber-400 dark:border-amber-900/40";
      default: return "bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/60";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-rose-500 font-semibold";
      case "medium": return "text-amber-500 font-semibold";
      default: return "text-emerald-500 font-semibold";
    }
  };

  const filteredSolutions = solutions
    .filter(sol => activeCategory === "all" || sol.category === activeCategory)
    .filter(sol => {
      const query = searchQuery.toLowerCase();
      return (
        sol.title.toLowerCase().includes(query) ||
        sol.issueDescription.toLowerCase().includes(query) ||
        sol.stepsToFix.some(step => step.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      // Prioritize unfixed ones first, then by priority
      const aFixed = fixedSolutionIds.includes(a.id);
      const bFixed = fixedSolutionIds.includes(b.id);
      if (aFixed !== bFixed) return aFixed ? 1 : -1;
      return a.priority - b.priority;
    });

  return (
    <div id="developer-fixes-panel" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d0d] p-5 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Wrench className="text-emerald-400 shrink-0" size={16} />
          </div>
          <div>
            <h3 className="font-sans font-bold text-white text-xs tracking-wide uppercase">Actionable Developer Solutions</h3>
            <p className="text-xs text-slate-500">Step-by-step code refinements and compliance optimizations.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fixedSolutionIds.length > 0 && (
            <span className="text-xs font-sans font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 size={13} />
              Simulated {fixedSolutionIds.length} fixed issues
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-3.5 text-slate-500">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search optimization fixes, codes, or bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#121212] text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-sans placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/10"
          />
        </div>

        {/* Categories Tab Selector */}
        <div className="flex overflow-x-auto scrollbar-none border border-white/5 p-1 rounded-xl bg-[#0d0d0d] gap-1 select-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-1.5 bg-transparent border-0 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-white/5 text-white shadow-md border border-white/10"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Solutions List Accordion */}
      {filteredSolutions.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/5 bg-white/[0.01] rounded-2xl">
          <p className="text-slate-500 text-xs font-sans">No matching fixes found in this category.</p>
        </div>
      ) : (
        <div id="fixes-accordion-container" className="space-y-3.5">
          {filteredSolutions.map((sol) => {
            const isExpanded = expandedId === sol.id;
            const isFixed = fixedSolutionIds.includes(sol.id);

            return (
              <div
                id={`solution-row-${sol.id}`}
                key={sol.id}
                className={`border rounded-2xl transition-all duration-300 ${
                  isFixed 
                    ? "border-emerald-500/20 bg-emerald-500/[0.02] opacity-80"
                    : isExpanded
                      ? "border-white/15 bg-[#0d0d0d] shadow-lg"
                      : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]"
                }`}
              >
                {/* Header block */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : sol.id)}
                  className="flex items-center justify-between p-4 sm:p-5 cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSimulatedFix(sol.id);
                      }}
                      className={`shrink-0 p-2 rounded-xl border transition-all ${
                        isFixed
                          ? "bg-emerald-600 text-white border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          : "bg-[#121212] text-slate-500 border-white/5 hover:text-emerald-400 hover:border-emerald-500/30"
                      }`}
                      title={isFixed ? "Undo Simulated Fixed Score" : "Simulate This Fix for Dynamic Scoring"}
                    >
                      <Check size={14} className={isFixed ? "stroke-[3px]" : ""} />
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-wide uppercase border rounded bg-white/5 border-white/10 text-slate-400`}>
                          Priority P{sol.priority}
                        </span>
                        <span className="text-slate-500 text-[10px] capitalize font-mono">
                          {sol.category}
                        </span>
                      </div>
                      <h4 className={`font-serif font-semibold text-xs text-white mt-1 leading-relaxed ${isFixed ? "line-through text-slate-600" : ""}`}>
                        {sol.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end text-[10px] font-sans">
                      <span className="text-slate-500">Impact</span>
                      <span className={getImpactColor(sol.potentialImpact)}>{sol.potentialImpact.toUpperCase()}</span>
                    </div>
                    <span className="text-slate-500 p-1">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-5 sm:p-6 space-y-5 text-xs">
                    {/* Description */}
                    <div className="flex gap-3 bg-white/[0.01] p-4 rounded-xl border border-white/5 text-slate-400 leading-relaxed font-sans">
                      <ShieldAlert className="text-slate-500 shrink-0 mt-0.5" size={15} />
                      <p className="leading-relaxed font-sans">{sol.issueDescription}</p>
                    </div>

                    {/* Steps To Fix */}
                    <div className="space-y-2.5">
                      <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-450 block text-slate-300">Implementation Checklist</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sol.stepsToFix.map((step, index) => (
                          <div key={index} className="flex gap-2 items-start py-0.5">
                            <CornerDownRight size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-slate-400 leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Code Snippet */}
                    {sol.codeSnippet && (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 bg-white/[0.02] border-t border-x border-white/5 px-4 py-2 rounded-t-xl">
                          <span className="font-semibold text-slate-300 uppercase text-[9px] tracking-wide">Developer Integration Snippet</span>
                          <button
                            onClick={() => handleCopyCode(sol.id, sol.codeSnippet!)}
                            className="flex items-center gap-1.5 hover:text-white bg-transparent border-0 transition-colors cursor-pointer text-slate-500 font-semibold"
                          >
                            {copiedId === sol.id ? (
                              <>
                                <Check size={12} className="text-emerald-400 stroke-[3px]" />
                                <span className="text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span className="tracking-wide text-[10px]">Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 bg-black text-emerald-400/90 font-mono text-[10px] overflow-x-auto rounded-b-xl border border-white/5 leading-relaxed shadow-inner">
                          <code>{sol.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Simulation alert details */}
                    <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-white/5">
                      <span className="text-slate-500 text-[10px]">Difficulty Complexity: <strong className="text-slate-300 capitalize">{sol.difficulty}</strong></span>
                      
                      <button
                        onClick={() => onToggleSimulatedFix(sol.id)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                          isFixed
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700/50"
                        }`}
                      >
                        {isFixed ? "Mark as Active Bug" : "Solve compliance gap"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
