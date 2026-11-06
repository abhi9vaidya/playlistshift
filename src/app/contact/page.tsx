import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = constructMetadata({
  title: "Contact Us - PlaylistShift Support",
  description:
    "Get in touch with the PlaylistShift team for support, feature feedback, partnership questions, or API inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Contact Support
        </h1>
        <p className="text-base text-textMuted max-w-xl mx-auto leading-relaxed">
          Have a question about a conversion, feedback on song matching, or need assistance? We are here to help.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-8 sm:p-10 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surfaceHover border border-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brandGreen/10 text-brandGreen flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Email Support</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              For general support inquiries, feedback, and bug reports:
            </p>
            <p className="text-sm font-semibold text-brandGreen">
              support@playlistshift.com
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surfaceHover border border-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brandPurple/10 text-brandPurple flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Privacy & Legal</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              For data deletion requests or API policy questions:
            </p>
            <p className="text-sm font-semibold text-brandPurple">
              privacy@playlistshift.com
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#090A0F] border border-borderSubtle text-xs text-textMuted space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ShieldCheck className="w-4 h-4 text-brandGreen" /> Response Expectations
          </div>
          <p>
            We typically respond to community inquiries within 1–2 business days. If you are reporting an issue with song matching, please include the playlist URL or track title to help us investigate.
          </p>
        </div>
      </div>
    </div>
  );
}

