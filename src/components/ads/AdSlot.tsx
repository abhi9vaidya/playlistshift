"use client";

import React, { useEffect, useState } from "react";

export type AdSlotPlacement =
  | "header-banner"
  | "below-hero"
  | "between-content"
  | "sidebar-desktop"
  | "footer-banner";

interface AdSlotProps {
  placement: AdSlotPlacement;
  slotId?: string;
  className?: string;
}

/**
 * Reusable Google AdSense ad slot component.
 * Disabled by default (NEXT_PUBLIC_ADSENSE_ENABLED=false).
 * Complies with Google AdSense Publisher Policies:
 * - Visually labeled as "Advertisement"
 * - Safe spacing away from application conversion controls
 * - Zero intrusive layout shifts
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  placement,
  slotId,
  className = "",
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    const enabled =
      process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" &&
      Boolean(clientId) &&
      !clientId?.includes("0000000000000000");

    setIsEnabled(enabled);

    if (enabled && typeof window !== "undefined") {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        // Silent catch for adblockers or script load blocks
      }
    }
  }, [clientId]);

  // When ads are disabled, render nothing or a safe minimal spacer
  if (!isEnabled) {
    return null;
  }

  const dimensions = {
    "header-banner": "min-h-[90px] max-w-[728px] mx-auto",
    "below-hero": "min-h-[100px] max-w-[970px] mx-auto my-8",
    "between-content": "min-h-[250px] max-w-[728px] mx-auto my-12",
    "sidebar-desktop": "min-h-[600px] w-[300px]",
    "footer-banner": "min-h-[90px] max-w-[728px] mx-auto mt-12 mb-6",
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl bg-surface/50 border border-borderSubtle text-center my-6 ${dimensions[placement]} ${className}`}
      aria-label="Advertisement"
    >
      <span className="text-[10px] uppercase tracking-wider text-textSubtle mb-1 select-none">
        Advertisement
      </span>

      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId || "0000000000"}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
