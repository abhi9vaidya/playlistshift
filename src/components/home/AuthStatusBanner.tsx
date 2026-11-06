"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export const AuthStatusBanner: React.FC = () => {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const auth = searchParams.get("auth");
    const error = searchParams.get("auth_error");

    if (auth === "success") {
      setStatus("success");
      setMessage("Connected to YouTube successfully! Your active conversion is ready to export.");
      setVisible(true);
    } else if (error) {
      setStatus("error");
      if (error === "access_denied" || error === "cancelled") {
        setMessage("Google sign-in was cancelled. You can review your matches and connect when you are ready.");
      } else if (error === "not_configured") {
        setMessage("Google OAuth credentials are not configured on the server. Please check GOOGLE_CLIENT_ID.");
      } else {
        setMessage(`Authentication note: ${error.replace(/_/g, " ")}`);
      }
      setVisible(true);
    }
  }, [searchParams]);

  if (!visible || !status) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border transition-all animate-fade-in ${
          status === "success"
            ? "bg-brandGreen/10 border-brandGreen/30 text-brandGreen shadow-[0_0_20px_rgba(0,229,153,0.1)]"
            : "bg-surfaceHover border-border text-textMuted"
        }`}
      >
        <div className="flex items-center gap-3">
          {status === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-brandGreen" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          )}
          <span className="text-sm font-medium text-white">{message}</span>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="p-1 text-textMuted hover:text-white rounded-lg transition-colors ml-4"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

