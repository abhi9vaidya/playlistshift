"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_DATA } from "@/config/faq";

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-[#0B0C12] border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="text-sm text-textMuted">
            Clear answers about conversions, playlist privacy, and account security.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-surface border border-border overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-surfaceHover/50 transition-colors"
                >
                  <span className="text-base font-semibold text-white">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-textMuted shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brandGreen" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-textMuted leading-relaxed border-t border-borderSubtle">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
