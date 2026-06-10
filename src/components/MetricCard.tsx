import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  id: string;
  title: string;
  score: number;
  color: 'emerald' | 'amber' | 'rose' | 'indigo';
  icon: LucideIcon;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

export default function MetricCard({
  id,
  title,
  score,
  color,
  icon: Icon,
  description,
  isActive,
  onClick
}: MetricCardProps) {
  // Determine color maps matching Sophisticated Dark
  const colorSchemes = {
    emerald: {
      text: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      border: "border-white/5",
      activeBorder: "border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.15)]",
      stroke: "#10b981",
      trail: "#1f2937"
    },
    amber: {
      text: "text-amber-400",
      bgClass: "bg-amber-500/10",
      border: "border-white/5",
      activeBorder: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      stroke: "#f59e0b",
      trail: "#1f2937"
    },
    rose: {
      text: "text-rose-400",
      bgClass: "bg-rose-500/10",
      border: "border-white/5 border-rose-500/20",
      activeBorder: "border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      stroke: "#f43f5e",
      trail: "#1f2937"
    },
    indigo: {
      text: "text-indigo-400",
      bgClass: "bg-indigo-500/10",
      border: "border-white/5",
      activeBorder: "border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]",
      stroke: "#6366f1",
      trail: "#1f2937"
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;
  
  // Rating phrase
  const getRatingText = (val: number) => {
    if (val >= 90) return "Excellent";
    if (val >= 70) return "Fair";
    return "Needs Review";
  };

  // SVG Circular math
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      id={`metric-card-${id}`}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className={`relative flex flex-col justify-between p-6 bg-[#121212] rounded-3xl border transition-all duration-300 cursor-pointer ${
        isActive 
          ? `${scheme.activeBorder}`
          : `${scheme.border} hover:border-emerald-500/20`
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 mb-4 transition-colors">
            <Icon size={18} />
          </span>
          <h3 className="font-sans font-semibold text-xs text-slate-500 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 pr-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Dynamic gauge circle */}
        <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-white/5"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Foreground circle */}
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              stroke={scheme.stroke}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-serif font-bold text-white leading-none">
              {score}
            </span>
            <span className="text-[8px] font-sans font-semibold text-slate-500 mt-1 leading-none uppercase tracking-wide">
              {getRatingText(score)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
