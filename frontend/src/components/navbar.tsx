"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, Code2, Layers, Menu, X, ArrowUpRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 shadow-xl shadow-black/60 py-2.5"
          : "bg-zinc-950/60 backdrop-blur-xs border-b border-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-lg overflow-hidden border border-orange-500/30 bg-zinc-900 flex items-center justify-center p-0.5 shadow-sm group-hover:border-orange-500 transition-colors shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="FreeAPI Logo"
              className="h-full w-full object-contain rounded-md"
            />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base tracking-tight group-hover:text-orange-400 transition-colors">
              FreeAPI
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 font-semibold">
              v1.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation: Exactly 2 Main Shortcuts */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <Link
            href="#endpoints"
            className="flex items-center gap-1.5 hover:text-orange-400 transition-colors py-1 group"
          >
            <Code2 className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
            <span>Endpoints API</span>
          </Link>
          <Link
            href="#tools"
            className="flex items-center gap-1.5 hover:text-orange-400 transition-colors py-1 group"
          >
            <Layers className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
            <span>Web Tools</span>
          </Link>
          <a
            href={`${API_BASE_URL}/api/status`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-orange-400 transition-colors font-mono text-xs border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 rounded-full text-zinc-400 hover:border-orange-500/40"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span>Backend Status</span>
          </a>
        </nav>

        {/* Right CTA Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <a href={`${API_BASE_URL}/api/stats`} target="_blank" rel="noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:text-orange-400 text-zinc-300"
            >
              <Terminal className="h-3.5 w-3.5 text-orange-500" />
              API Stats
            </Button>
          </a>
          <a href="#endpoints">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-sm">
              <Code2 className="h-3.5 w-3.5 mr-1" />
              API Console
            </Button>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <a href="#endpoints">
            <Button size="sm" className="h-8 px-2.5 text-xs bg-orange-600 hover:bg-orange-500 text-white">
              Console
            </Button>
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950/98 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            <Link
              href="#endpoints"
              onClick={closeMobileMenu}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-sm font-medium text-zinc-200 hover:text-orange-400 hover:border-orange-500/30 transition-colors"
            >
              <Code2 className="h-4 w-4 text-orange-500" />
              <span>Daftar Endpoints API</span>
            </Link>
            <Link
              href="#tools"
              onClick={closeMobileMenu}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-sm font-medium text-zinc-200 hover:text-orange-400 hover:border-orange-500/30 transition-colors"
            >
              <Layers className="h-4 w-4 text-orange-500" />
              <span>Katalog Web Tools</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <a
              href={`${API_BASE_URL}/api/status`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-orange-400"
            >
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Backend Status</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href={`${API_BASE_URL}/api/stats`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-400"
            >
              Stats DB & Telemetry →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
