import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { BrandLogo } from "../ui/BrandLogo";
import { Shield, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0B0C12] border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-flex">
              <BrandLogo size="sm" />
            </Link>
            <p className="text-sm text-textMuted leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-brandGreen pt-2">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Free • No music files stored or pirated</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Converters & Guides
            </h4>
            <ul className="space-y-2.5">
              {siteConfig.footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-textMuted hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {siteConfig.footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-textMuted hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Legal & Privacy
            </h4>
            <ul className="space-y-2.5">
              {siteConfig.footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-textMuted hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-borderSubtle space-y-4 text-xs text-textSubtle leading-relaxed">
          <p>
            <strong className="text-textMuted">Disclaimer:</strong> Spotify is a registered trademark of Spotify AB. YouTube and YouTube Music are registered trademarks of Google LLC. PlaylistShift is an independent conversion utility and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Spotify, Google, or any of their subsidiaries or affiliates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p>© {new Date().getFullYear()} PlaylistShift. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brandGreen" /> Built for music lovers worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

