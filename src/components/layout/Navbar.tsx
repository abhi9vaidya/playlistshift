"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "../ui/Button";
import { BrandLogo } from "../ui/BrandLogo";
import { ArrowRight, LogOut, Menu, User, X } from "lucide-react";
import { UserSessionData } from "@/types";

export const Navbar: React.FC = () => {
  const [session, setSession] = useState<UserSessionData>({ isAuthenticated: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => {});

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession({ isAuthenticated: false });
      window.location.reload();
    } catch {
      // Ignore
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#090A0F]/90 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group inline-flex">
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-textMuted hover:text-white transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Auth / CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          {session.isAuthenticated && session.user ? (
            <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-3 py-1.5">
              {session.user.picture ? (
                <img
                  src={session.user.picture}
                  alt={session.user.name}
                  className="w-7 h-7 rounded-full border border-border"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brandPurple/20 text-brandPurple flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="text-left text-xs pr-1">
                <p className="font-semibold text-white leading-tight truncate max-w-[120px]">
                  {session.user.name}
                </p>
                <p className="text-[10px] text-brandGreen">YouTube Connected</p>
              </div>
              <button
                onClick={handleLogout}
                title="Disconnect YouTube"
                className="p-1 text-textMuted hover:text-brandRed hover:bg-surfaceHover rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/api/auth/google">
              <Button variant="secondary" size="sm" leftIcon={<User className="w-4 h-4 text-brandPurple" />}>
                Connect YouTube
              </Button>
            </Link>
          )}

          <Link href="#convert">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Convert Now
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-textMuted hover:text-white rounded-lg focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#11131A] border-b border-border px-4 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-3">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-textMuted hover:text-white transition-colors py-1"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {session.isAuthenticated && session.user ? (
              <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  {session.user.picture ? (
                    <img
                      src={session.user.picture}
                      alt={session.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brandPurple/20 text-brandPurple flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{session.user.name}</p>
                    <p className="text-xs text-brandGreen">YouTube Connected</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-brandRed hover:underline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <Link href="/api/auth/google" className="w-full">
                <Button variant="secondary" className="w-full">
                  Connect YouTube
                </Button>
              </Link>
            )}

            <Link href="#convert" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" className="w-full">
                Start Free Conversion
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

