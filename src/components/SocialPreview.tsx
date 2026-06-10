import { useState } from "react";
import { SocialShareability } from "../types";
import { 
  Share2, 
  MessageSquare, 
  Facebook, 
  Twitter, 
  Globe, 
  Sparkles,
  Info
} from "lucide-react";

interface SocialPreviewProps {
  social: SocialShareability;
  url: string;
}

export default function SocialPreview({ social, url }: SocialPreviewProps) {
  const [activeTab, setActiveTab] = useState<"slack" | "facebook" | "twitter" | "serp">("slack");

  const cleanHost = url.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];
  const { openGraph, twitterCards, suggestions } = social;

  const defaultTitle = openGraph.exists ? openGraph.title : "Untitled Web Document";
  const defaultDesc = openGraph.exists ? openGraph.description : "No Meta description or OpenGraph descriptions are declared in this document headings.";
  const defaultImage = openGraph.exists ? openGraph.image : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop";

  return (
    <div id="social-shareability-analyser-animation" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Simulation preview mockups card list */}
      <div className="xl:col-span-2 bg-[#0d0d0d] border border-white/5 shadow-xl rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
          <div>
            <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 size={14} className="text-slate-500" />
              Social Index Sharing Simulation Previews
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">Visualize on-page OpenGraph header rendering on popular platforms.</p>
          </div>

          {/* Social Platform Selection Selector */}
          <div className="flex overflow-x-auto scrollbar-none p-1 border border-white/5 bg-[#121212] rounded-xl gap-1 shrink-0 select-none">
            <button
              onClick={() => setActiveTab("slack")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-0 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                activeTab === "slack"
                  ? "bg-white/5 text-white shadow-md border border-white/10"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <MessageSquare size={13} />
              Slack
            </button>
            <button
              onClick={() => setActiveTab("facebook")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-0 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                activeTab === "facebook"
                  ? "bg-white/5 text-white shadow-md border border-white/10"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Facebook size={13} />
              Facebook
            </button>
            <button
              onClick={() => setActiveTab("twitter")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-0 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                activeTab === "twitter"
                  ? "bg-white/5 text-white shadow-md border border-white/10"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Twitter size={13} />
              Twitter/X
            </button>
            <button
              onClick={() => setActiveTab("serp")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-0 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                activeTab === "serp"
                  ? "bg-white/5 text-white shadow-md border border-white/10"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Globe size={13} />
              SERP
            </button>
          </div>
        </div>

        {/* Dynamic Canvas preview box depends on type */}
        <div className="bg-[#121212] p-5 sm:p-6 rounded-2xl border border-dashed border-white/10 min-h-[220px] flex items-center justify-center">
          
          {/* SLACK MOCKUP PREVIEW */}
          {activeTab === "slack" && (
            <div id="slack-frame" className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 max-w-lg w-full shadow-lg font-sans flex gap-3.5 text-xs leading-relaxed">
              {/* Slack left visual color accent block */}
              <div className="w-1 bg-[#22c55e] shrink-0 rounded-sm" />
              <div className="space-y-2 min-w-0">
                <span className="text-slate-500 text-[9px] font-mono font-bold tracking-wider uppercase">Slack Integration Snippet</span>
                <span className="font-bold text-emerald-400 hover:underline cursor-pointer block">{cleanHost}</span>
                <h5 className="font-serif font-bold text-white text-xs hover:underline cursor-pointer leading-relaxed">
                  {defaultTitle}
                </h5>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {defaultDesc}
                </p>
                {defaultImage && (
                  <div className="mt-3.5 max-h-48 overflow-hidden rounded-lg border border-white/5">
                    <img src={defaultImage} alt="Slack Social Preview Graphic" className="w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FACEBOOK CARD MOCKUP */}
          {activeTab === "facebook" && (
            <div id="facebook-frame" className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden max-w-md w-full shadow-lg font-sans text-xs">
              {/* Header profile block */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-bold flex items-center justify-center text-emerald-450">
                  U
                </div>
                <div>
                  <span className="font-bold text-white block">Site Administrator</span>
                  <span className="text-[10px] text-slate-500 block">Shared with public group • Just now</span>
                </div>
              </div>
              <p className="px-4 pb-4 text-slate-400 leading-relaxed">Evaluating standard Web 3.0 OpenGraph metadata tags on isolated virtual DOM environments.</p>
              
              {/* Main Card */}
              <div className="border-t border-white/5">
                <div className="h-44 overflow-hidden bg-black/40">
                  <img src={defaultImage} alt="Facebook Social Preview Card" className="w-full h-full object-cover animate-pulse" referrerPolicy="no-referrer" />
                </div>
                <div className="p-4 bg-[#0d0d0d] border-t border-white/5 animate-fade-in">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#22c55e] font-bold block">{cleanHost}</span>
                  <h5 className="font-serif font-bold text-white text-xs mt-1.5 leading-relaxed truncate">
                    {defaultTitle}
                  </h5>
                  <p className="text-slate-450 text-[11px] mt-1.5 leading-relaxed line-clamp-1">
                    {defaultDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TWITTER CARD MOCKUP */}
          {activeTab === "twitter" && (
            <div id="twitter-frame" className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden max-w-sm w-full shadow-lg font-sans text-xs">
              <div className="h-36 overflow-hidden bg-black/40">
                <img src={defaultImage} alt="Twitter Social Preview Card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-4 border-t border-white/5">
                <span className="text-[9px] tracking-widest text-slate-500 font-mono font-bold block">{cleanHost}</span>
                <h5 className="font-serif font-bold text-white text-xs mt-1.5 leading-relaxed truncate">
                  {defaultTitle}
                </h5>
                <p className="text-slate-400 text-[10px] mt-1 leading-relaxed line-clamp-1">
                  {defaultDesc}
                </p>
              </div>
            </div>
          )}

          {/* GOOGLE SERP RESULTS LIST */}
          {activeTab === "serp" && (
            <div id="google-serp-frame" className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-lg font-sans text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-[9px] font-bold text-slate-400 font-serif">G</span>
                <span className="truncate text-slate-450 font-mono">{url}</span>
              </div>
              <h5 className="text-[14px] leading-snug text-emerald-400 font-serif font-bold hover:underline cursor-pointer">
                {defaultTitle}
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed pt-0.5">
                <span className="text-slate-500 font-mono mr-1">Jun 10, 2026 —</span>
                {defaultDesc.substring(0, 160)}...
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Social diagnosis metadata checks */}
      <div className="xl:col-span-1 bg-[#0d0d0d] border border-white/5 shadow-xl rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-slate-500" />
            Social Graph Diagnosis Indices
          </h4>
          
          <div className="space-y-3.5 mt-3">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-slate-450 font-sans">OpenGraph Schema Tags</span>
              <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                openGraph.exists 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                  : "bg-rose-500/10 text-rose-450 border border-rose-500/10"
              }`}>
                {openGraph.exists ? "Active" : "Missing / Warning"}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-slate-450 font-sans">Twitter Card Declarations</span>
              <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                twitterCards.exists 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                  : "bg-rose-500/10 text-rose-450 border border-rose-500/10"
              }`}>
                {twitterCards.exists ? "Active" : "Missing / Warning"}
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest block">Diagnostics Audit Checklist</span>
              {suggestions.map((s, idx) => (
                <div key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-400 font-sans">
                  <Info size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 mt-5 border-t border-white/5 text-[10px] text-slate-400 leading-relaxed bg-white/[0.01] p-3 rounded-xl flex gap-2">
          <Info size={13} className="shrink-0 text-slate-500 mt-0.5" />
          <span>Adding OpenGraph structure to your pages increases click-through CTRs by up to 34% when shared on social mediums.</span>
        </div>
      </div>
    </div>
  );
}
