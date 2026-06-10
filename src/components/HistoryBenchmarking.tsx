import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { HistoryBenchmark } from "../types";
import { LineChart as ChartIcon, CheckSquare, Clock, Trash2, ShieldCheck, AlertCircle } from "lucide-react";

interface HistoryBenchmarkingProps {
  history: HistoryBenchmark[];
  onClearHistory: () => void;
  onApplySnapshot: (index: number) => void;
  hostName: string;
}

export default function HistoryBenchmarking({
  history,
  onClearHistory,
  onApplySnapshot,
  hostName
}: HistoryBenchmarkingProps) {

  const formattedChartData = history.map((h) => {
    const d = new Date(h.timestamp);
    const timeStr = isNaN(d.getTime()) 
      ? "Recent Scan" 
      : `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return {
      name: timeStr,
      Performance: h.performanceScore,
      "SEO Compliance": h.seoScore,
      Accessibility: h.accessibilityScore
    };
  });

  return (
    <div id="historical-benchmark-tracker animate-fade-in" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Time Series graph tracking progress */}
      <div className="xl:col-span-2 bg-[#0d0d0d] border border-white/5 shadow-xl rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <ChartIcon size={14} className="text-slate-500" />
              Automated Progress Reports vs. Benchmarks
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">Tracking consecutive metrics audits for domain {hostName}.</p>
          </div>

          {history.length > 1 && (
            <button
              onClick={onClearHistory}
              className="text-slate-500 hover:text-rose-400 bg-transparent border-0 flex items-center gap-1.5 transition-colors cursor-pointer text-[9px] font-mono uppercase tracking-widest font-bold"
            >
              <Trash2 size={12} />
              Reset Logs
            </button>
          )}
        </div>

        {history.length < 2 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center bg-[#121212] rounded-2xl border border-dashed border-white/10 p-4">
            <Clock size={20} className="text-slate-650 mb-2.5 animate-pulse" />
            <span className="text-xs font-serif font-bold text-slate-400 uppercase tracking-wider">Insufficient Timeline Data</span>
            <p className="text-xs text-slate-550 max-w-sm mt-1.5 leading-relaxed">
              Run another audit for {hostName} to begin plotting consecutive score lines and generate automated progress metrics logs.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedChartData}
                margin={{ top: 10, right: 15, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
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
                <Legend wrapperStyle={{ fontSize: 10, marginTop: 15, color: "#94a3b8" }} />
                <Line
                  type="monotone"
                  dataKey="Performance"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="SEO Compliance"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Accessibility"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Snapshot Log list */}
      <div className="xl:col-span-1 bg-[#0d0d0d] border border-white/5 shadow-xl rounded-2xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldCheck size={14} className="text-slate-500" />
            Audit Benchmark Sessions
          </h4>

          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-550 text-xs font-sans">
              No historical sessions available. Add a URL to begin audit sessions.
            </div>
          ) : (
            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {history.map((h, i) => {
                const dateObj = new Date(h.timestamp);
                const showStr = isNaN(dateObj.getTime()) 
                  ? "Snapshot Raw Entry" 
                  : dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={i}
                    onClick={() => onApplySnapshot(i)}
                    className="p-4 rounded-xl border border-white/5 bg-[#121212] text-xs hover:border-emerald-500/30 hover:bg-white/[0.01] cursor-pointer flex flex-col gap-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                      <span className="text-[10px] tracking-wider uppercase">Snapshot #{history.length - i}</span>
                      <span className="text-[9px] text-slate-500 font-normal">{showStr}</span>
                    </div>

                    <div className="flex items-center gap-3.5 mt-1 text-[10px] font-sans">
                      <span className="text-slate-450 flex items-center gap-1.5 font-medium">
                        Perf: <strong className="text-emerald-400 font-mono font-bold">{h.performanceScore}</strong>
                      </span>
                      <span className="text-white/10">•</span>
                      <span className="text-slate-450 flex items-center gap-1.5 font-medium">
                        SEO: <strong className="text-indigo-400 font-mono font-bold">{h.seoScore}</strong>
                      </span>
                      <span className="text-white/10">•</span>
                      <span className="text-slate-450 flex items-center gap-1.5 font-medium">
                        Access: <strong className="text-amber-400 font-mono font-bold">{h.accessibilityScore}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 mt-5 border-t border-white/5 text-[10px] text-slate-400 leading-relaxed bg-white/[0.01] p-3 rounded-xl flex gap-2">
          <AlertCircle size={14} className="shrink-0 text-amber-500 mt-0.5" />
          <span>Comparing active snapshots dynamically isolates whether your code changes are successfully satisfying search engine crawling loops. See recommended solutions to repair failures fast.</span>
        </div>
      </div>
    </div>
  );
}
