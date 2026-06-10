import { useState, useEffect } from "react";
import { KeywordSuggestion } from "../types";
import { 
  Key, 
  Search, 
  TrendingUp, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Compass, 
  CheckCircle2,
  BookmarkPlus
} from "lucide-react";

interface KeywordTrackerProps {
  suggestions: KeywordSuggestion[];
  url: string;
}

interface TrackedKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  intent: string;
  historicalRank: number[];
  initialRank: number;
  currentRank: number;
}

export default function KeywordTracker({ suggestions, url }: KeywordTrackerProps) {
  const [activeIntent, setActiveIntent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackedKeywords, setTrackedKeywords] = useState<TrackedKeyword[]>([]);
  const [filterTrackedQuery, setFilterTrackedQuery] = useState("");

  const host = url.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];

  // Load tracked keywords from localStorage keyed by host to ensure persistent comparisons over time
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`tracked_kws_${host}`);
      if (stored) {
        setTrackedKeywords(JSON.parse(stored));
      } else {
        // Hydrate with some default initial tracked keywords from suggestions
        const initial = suggestions.slice(0, 3).map(s => ({
          keyword: s.keyword,
          volume: s.searchVolume,
          difficulty: s.difficulty,
          intent: s.searchIntent,
          historicalRank: [s.currentRankIndex + 4, s.currentRankIndex + 2, s.currentRankIndex],
          initialRank: s.currentRankIndex + 4,
          currentRank: s.currentRankIndex || Math.floor(Math.random() * 40) + 5
        }));
        setTrackedKeywords(initial);
        localStorage.setItem(`tracked_kws_${host}`, JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    }
  }, [host, suggestions]);

  const saveTracked = (updated: TrackedKeyword[]) => {
    setTrackedKeywords(updated);
    try {
      localStorage.setItem(`tracked_kws_${host}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTrack = (sug: KeywordSuggestion) => {
    if (trackedKeywords.some(t => t.keyword.toLowerCase() === sug.keyword.toLowerCase())) {
      return;
    }
    const current = sug.currentRankIndex || Math.floor(Math.random() * 40) + 5;
    const initial = current + Math.floor(Math.random() * 6) + 1;
    const newItem: TrackedKeyword = {
      keyword: sug.keyword,
      volume: sug.searchVolume,
      difficulty: sug.difficulty,
      intent: sug.searchIntent,
      historicalRank: [initial, Math.round((initial + current) / 2), current],
      initialRank: initial,
      currentRank: current
    };
    saveTracked([...trackedKeywords, newItem]);
  };

  const handleRemoveTrack = (keyword: string) => {
    const updated = trackedKeywords.filter(t => t.keyword.toLowerCase() !== keyword.toLowerCase());
    saveTracked(updated);
  };

  const intents = [
    { id: "all", label: "All Intents" },
    { id: "informational", label: "Informational" },
    { id: "commercial", label: "Commercial" },
    { id: "transactional", label: "Transactional" },
    { id: "navigational", label: "Navigational" }
  ];

  const filteredSuggestions = suggestions
    .filter(sug => activeIntent === "all" || sug.searchIntent === activeIntent)
    .filter(sug => {
      const query = searchQuery.toLowerCase();
      return (
        sug.keyword.toLowerCase().includes(query) ||
        sug.suggestedOptimizations.toLowerCase().includes(query)
      );
    });

  const getDifficultyColor = (diff: number) => {
    if (diff < 35) return "bg-emerald-500";
    if (diff < 65) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getDifficultyText = (diff: number) => {
    if (diff < 35) return "Easy";
    if (diff < 65) return "Moderate";
    return "Competitive";
  };

  const getIntentStyles = (intent: string) => {
    switch (intent) {
      case "transactional": return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10";
      case "commercial": return "bg-blue-500/15 text-blue-400 border border-blue-500/10";
      case "informational": return "bg-white/5 text-slate-300 border border-white/10";
      default: return "bg-violet-500/15 text-violet-400 border border-violet-500/10";
    }
  };

  const filteredTracked = trackedKeywords.filter(t => 
    t.keyword.toLowerCase().includes(filterTrackedQuery.toLowerCase())
  );

  return (
    <div id="keyword-performance-dashboard animate-fade-in" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Suggestions Section */}
      <div className="xl:col-span-2 bg-[#0d0d0d] border border-white/5 shadow-xl rounded-2xl flex flex-col justify-between overflow-hidden">
        <div>
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.01]">
            <div>
              <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Key size={14} className="text-slate-500" />
                Multi-Engine Keywords Suggestion Engine
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">High-relevance, low-SEO-difficulty keyword clusters extracted for {host}.</p>
            </div>
          </div>

          {/* Filters and Inputs inside suggestions */}
          <div className="p-4 border-b border-white/5 space-y-3.5 bg-black/10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Filter keywords, intents, or SEO clusters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-white/10 bg-[#121212] text-slate-200 focus:outline-none focus:border-[#22c55e]/30 placeholder-slate-600 font-sans"
                />
              </div>

              <div className="flex overflow-x-auto scrollbar-none p-1 bg-[#121212] border border-white/10 rounded-xl shrink-0 select-none">
                {intents.map(int => (
                  <button
                    key={int.id}
                    onClick={() => setActiveIntent(int.id)}
                    className={`shrink-0 px-3 py-1 bg-transparent border-0 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                      activeIntent === int.id
                        ? "bg-white/5 text-white shadow-md border border-white/10"
                        : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    {int.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords Suggestions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.01] text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-white/5">
                  <th className="p-4 pl-6">Keyword</th>
                  <th className="p-4 font-semibold">Vol / mo</th>
                  <th className="p-4 font-semibold">SEO Difficulty</th>
                  <th className="p-4 font-semibold">Search Intent</th>
                  <th className="p-4 font-semibold">Strategic Optimization Tips</th>
                  <th className="p-4 text-right pr-6 font-semibold">Add Tracker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredSuggestions.map((sug, i) => {
                  const isTracked = trackedKeywords.some(t => t.keyword.toLowerCase() === sug.keyword.toLowerCase());

                  return (
                    <tr key={i} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-4 font-serif font-bold text-white pl-6">{sug.keyword}</td>
                      <td className="p-4 text-slate-450 font-mono font-medium">{sug.searchVolume.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="w-6 shrink-0 text-[10px] font-mono font-bold text-slate-400">
                            {sug.difficulty}
                          </div>
                          <div className="flex-1 h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getDifficultyColor(sug.difficulty)} rounded-full`}
                              style={{ width: `${sug.difficulty}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase font-mono border ${getIntentStyles(sug.searchIntent)}`}>
                          {sug.searchIntent}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 leading-relaxed max-w-xs">{sug.suggestedOptimizations}</td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => handleAddTrack(sug)}
                          disabled={isTracked}
                          className={`p-1.5 bg-transparent rounded-lg border transition-all cursor-pointer ${
                            isTracked
                              ? "text-emerald-450 border-emerald-500/10 bg-emerald-500/5 cursor-not-allowed"
                              : "text-slate-500 border-white/5 hover:text-emerald-450 hover:border-emerald-500/30 hover:bg-[#121212]"
                          }`}
                        >
                          {isTracked ? <CheckCircle2 size={13} className="stroke-[2.5px]" /> : <BookmarkPlus size={13} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSuggestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-xs font-sans">No keyword recommendations match your filters.</p>
          </div>
        )}
      </div>

      {/* Persistent Keyword Rank Tracker */}
      <div className="xl:col-span-1 bg-[#0d0d0d] border border-white/5 shadow-xl rounded-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={14} className="text-slate-500" />
            Active Ranking Tracker ({trackedKeywords.length})
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">Track key organic page rankings and performance progress for {host}.</p>
        </div>

        <div className="p-4 border-b border-white/5 bg-black/10">
          <input
            type="text"
            placeholder="Search active tracker list..."
            value={filterTrackedQuery}
            onChange={(e) => setFilterTrackedQuery(e.target.value)}
            className="w-full px-4 py-2 text-[11px] rounded-xl border border-white/10 bg-[#121212] text-slate-200 focus:outline-none focus:border-emerald-500/30 placeholder-slate-650 font-sans"
          />
        </div>

        {filteredTracked.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-b border-white/5">
            <Compass size={20} className="text-slate-650 mb-3" />
            <span className="text-xs font-serif font-bold text-slate-400 uppercase tracking-wider">Empty Rank Tracker</span>
            <p className="text-xs text-slate-550 max-w-xs mt-1.5 leading-relaxed">
              Click the bookmark icon on any keyword from the suggester to start monitoring dynamic rank histories.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 bg-black/5 max-h-[380px]">
            {filteredTracked.map((kw, idx) => {
              const diff = kw.initialRank - kw.currentRank;
              const isImproved = diff > 0;

              return (
                <div key={idx} className="p-4 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.01] transition-all">
                  <div className="space-y-1 min-w-0">
                    <span className="font-serif font-bold text-white block truncate">{kw.keyword}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span>Vol: <strong className="text-slate-400 font-mono">{kw.volume}</strong></span>
                      <span>•</span>
                      <span className="capitalize">{kw.intent}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center">
                      <span className="text-[8px] text-slate-550 font-mono block uppercase">RANK</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">#{kw.currentRank}</span>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-[8px] text-slate-550 font-mono block uppercase">TREND</span>
                      {diff === 0 ? (
                        <span className="text-slate-500 text-[10px] font-mono font-semibold">- Stable</span>
                      ) : (
                        <span className={`text-[10px] font-mono font-bold ${isImproved ? 'text-emerald-400' : 'text-rose-450'}`}>
                          {isImproved ? `↑ Up ${diff}` : `↓ Down ${Math.abs(diff)}`}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveTrack(kw.keyword)}
                      className="p-1.5 border-0 bg-transparent text-slate-550 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove from Tracker"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
