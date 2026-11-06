import React from "react";
import { MatchConfidenceTier } from "@/types";
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";

interface ConfidenceBadgeProps {
  score: number;
  tier: MatchConfidenceTier;
  reason?: string;
  showIcon?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  tier,
  reason,
  showIcon = true,
}) => {
  const configs = {
    excellent: {
      color: "bg-brandGreen/10 text-brandGreen border-brandGreen/30",
      label: "Excellent",
      icon: Sparkles,
    },
    good: {
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      label: "Good",
      icon: CheckCircle2,
    },
    review: {
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      label: "Review",
      icon: AlertTriangle,
    },
    low: {
      color: "bg-brandRed/10 text-brandRed border-brandRed/30",
      label: "Low Match",
      icon: AlertCircle,
    },
  };

  const current = configs[tier] || configs.low;
  const Icon = current.icon;

  return (
    <div className="inline-flex items-center gap-1.5" title={reason || `${score}% Match Confidence`}>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${current.color}`}
      >
        {showIcon && <Icon className="w-3 h-3 shrink-0" />}
        <span>{score}%</span>
        <span className="opacity-70 font-normal">• {current.label}</span>
      </span>
    </div>
  );
};
