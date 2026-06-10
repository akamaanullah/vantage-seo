import { CompetitorComparison } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  Zap, 
  ArrowLeftRight, 
  AlertTriangle 
} from "lucide-react";

interface CompetitorInsightProps {
  comparison?: CompetitorComparison;
}

export default function CompetitorInsight({ comparison }: CompetitorInsightProps) {
  if (!comparison) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 bg-white/[0.01] rounded-3xl text-center px-4">
        <AlertTriangle size={20} className="text-slate-500 mb-3" />
        <h4 className="font-serif font-semibold text-xs text-slate-300 uppercase tracking-wider">No Competitor Selected</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          Perform a new audit and specify a Competitor URL to activate side-by-side performance gap analysis.
        </p>
      </div>
    );
  }

  const { targetUrl, competitorUrl, targetMetrics, competitorMetrics, gapAnalysis, keywordsOverlap } = comparison;

  const cleanTarget = targetUrl.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];
  const cleanComp = competitorUrl.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];

  // Recharts payload structure
  const chartData = [
    {
      name: "Performance",
      [cleanTarget]: targetMetrics.performance,
      [cleanComp]: competitorMetrics.performance,
    },
    {
      name: "SEO Index",
      [cleanTarget]: targetMetrics.seo,
      [cleanComp]: competitorMetrics.seo,
    },
    {
      name: "Accessibility",
      [cleanTarget]: targetMetrics.accessibility,
      [cleanComp]: competitorMetrics.accessibility,
    }
  ];

  const getAdvantageStyles = (adv: "target" | "competitor" | "neutral") => {
    switch (adv) {
      case "target": return "bg-emerald-500/10 text-emerald-450 border-emerald-500/20";
      case "competitor": return "bg-rose-500/10 text-rose-450 border-rose-500/20";
      default: return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  const getAdvantageText = (adv: "target" | "competitor" | "neutral") => {
    if (adv === "target") return "Your Website Leads";
    if (adv === "competitor") return "Competitor Edge";
    return "Optimizations Linked";
  };

  return (
    <div id="competitor-comparison-view" className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 bg-[#0d0d0d] p-5 rounded-3xl border border-white/5 shadow-xl">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <ArrowLeftRight className="text-violet-400 shrink-0" size={16} />
        </div>
        <div>
          <h3 className="font-sans font-bold text-white text-xs tracking-wide uppercase">Real-Time Competitor Analysis</h3>
          <p className="text-xs text-slate-500">Cross-website audit comparing Core Web Vitals and organic keyword visibility flags.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gap analysis indicators */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`p-5 rounded-2xl border ${getAdvantageStyles(gapAnalysis.advantage)} bg-[#0d0d0d] shadow-lg`}>
            <span className="text-[9px] font-mono uppercase tracking-widest block text-slate-500">Status Advantage</span>
            <span className="font-serif font-bold text-base mt-2 flex items-center gap-2 text-white">
              <Zap size={15} className="text-emerald-400" />
              {getAdvantageText(gapAnalysis.advantage)}
            </span>
            <p className="text-xs mt-3 leading-relaxed text-slate-400 font-sans">{gapAnalysis.keyDifferentiator}</p>
          </div>

          <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-white/5 shadow-lg space-y-3">
            <h4 className="font-sans font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={13} className="text-slate-500" />
              Ranking Projection
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">{gapAnalysis.rankingPotential}</p>
          </div>

          {/* Speed gaps list */}
          <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-white/5 shadow-lg space-y-3.5">
            <h4 className="font-sans font-bold text-xs text-slate-300 uppercase tracking-wider">Speed Gap Contrast</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Load Time ({cleanTarget})</span>
                <span className="font-mono text-white font-bold">{(targetMetrics.loadTimeMs / 1000).toFixed(2)}s</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                <span className="text-slate-500 font-medium">Load Time ({cleanComp})</span>
                <span className="font-mono text-slate-400">{(competitorMetrics.loadTimeMs / 1000).toFixed(2)}s</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-medium">Size ({cleanTarget})</span>
                <span className="font-mono text-white font-bold">{targetMetrics.pageSizeKb} KB</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Size ({cleanComp})</span>
                <span className="font-mono text-slate-400">{competitorMetrics.pageSizeKb} KB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Comparative Chart */}
        <div className="lg:col-span-2 bg-[#0d0d0d] p-5 sm:p-6 rounded-2xl border border-white/5 shadow-lg">
          <h4 className="font-sans font-bold text-xs text-slate-300 uppercase tracking-wider mb-5 flex items-center justify-between">
            <span>Side-by-Side Scoring Index</span>
            <span className="text-[10px] text-slate-500 font-mono font-medium">Higher is Better</span>
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  tickLine={false} 
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 11, 
                    borderRadius: 12, 
                    backgroundColor: "#0d0d0d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#f8fafc"
                  }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: 10, marginTop: 15, color: "#94a3b8" }} 
                />
                <Bar dataKey={cleanTarget} fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} name={`Your Site (${cleanTarget})`} />
                <Bar dataKey={cleanComp} fill="#475569" radius={[4, 4, 0, 0]} barSize={28} name={`Competitor (${cleanComp})`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Keywords Position Gaps overlap */}
      <div className="bg-[#0d0d0d] rounded-2xl border border-white/5 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h4 className="font-sans font-bold text-xs text-slate-300 uppercase tracking-wider">Organic Ranking Overlap</h4>
          <p className="text-[11px] text-slate-500 mt-1">Where your business and target competitors are co-ranking on Google results pages.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.01] text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-white/5">
                <th className="p-4 font-semibold pl-6">Keyword / Query</th>
                <th className="p-4 font-semibold text-center">Your Rank</th>
                <th className="p-4 font-semibold text-center">Competitor Rank</th>
                <th className="p-4 font-semibold">Monthly Vol</th>
                <th className="p-4 font-semibold text-right pr-6">Search Opportunity Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {keywordsOverlap.map((kw, i) => {
                const isTargetWinning = kw.targetPosition < kw.competitorPosition && kw.targetPosition > 0;
                const volumeStr = kw.searchVolume.toLocaleString();
                
                return (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 font-serif font-bold text-white pl-6">{kw.keyword}</td>
                    <td className="p-4 text-center font-mono">
                      {kw.targetPosition === 0 ? (
                        <span className="text-slate-600">Not Ranked</span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          kw.targetPosition <= 3 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10" 
                            : "bg-white/5 text-slate-300 border border-white/10"
                        }`}>
                          #{kw.targetPosition}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-mono text-slate-500">
                      #{kw.competitorPosition}
                    </td>
                    <td className="p-4 text-slate-400 font-mono font-medium">{volumeStr}/mo</td>
                    <td className="p-4 text-right font-medium pr-6">
                      {isTargetWinning ? (
                        <span className="text-emerald-400 text-[10px] font-bold tracking-wide uppercase">Winning Rank ✔</span>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                          Gap: +{Math.max(0, kw.targetPosition - kw.competitorPosition)} Spaces
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
