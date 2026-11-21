"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Flame, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { copyToClipboard } from "@/lib/clipboard";

const DEMO_TABS = [
  {
    id: "brat",
    method: "GET",
    endpoint: "/api/maker/brat?text=365+party+girl",
    type: "image/png",
    previewType: "brat",
    status: 200,
    time: "38ms",
  },
  {
    id: "tiktok",
    method: "GET",
    endpoint: "/api/download/tiktok?url=https://vt.tiktok.com/ZSjV...",
    type: "application/json",
    previewType: "json",
    status: 200,
    time: "94ms",
    json: {
      status: "success",
      message: "Data TikTok berhasil diekstrak",
      data: {
        id: "743281903",
        post_type: "video",
        author: { username: "charli_xcx", nickname: "Charli" },
        media: [{ quality: "hd_no_watermark", size: "8.4 MB" }],
        music: { title: "Apple", author: "Charli XCX" },
      },
    },
  },
  {
    id: "spotify",
    method: "GET",
    endpoint: "/api/download/spotify?q=kamu+nanya",
    type: "application/json",
    previewType: "json",
    status: 200,
    time: "112ms",
    json: {
      status: "success",
      message: "Audio track matched via stream proxy",
      data: {
        title: "Kamu Nanya?",
        artist: "Alif Cepmek",
        duration: "02:45",
        stream: "https://audio-cdn.freeapi.local/stream.mp3",
      },
    },
  },
];

export function Hero3DShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(DEMO_TABS[0]);
  const [copied, setCopied] = useState(false);

  // 3D rotation state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);

      animationFrameId = requestAnimationFrame(() => {
        setScrollProgress(progress);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    setMouseOffset({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMouseOffset({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsHovering(true);
  };

  // Keep rotation flat/subtle on mobile for clean fit
  const tiltMultiplier = isMobile ? 0.2 : 1;
  const baseTiltX = (scrollProgress - 0.4) * 20 * tiltMultiplier;
  const mouseTiltX = isHovering && !isMobile ? -mouseOffset.y * 10 : 0;
  const mouseTiltY = isHovering && !isMobile ? mouseOffset.x * 12 : 0;

  const currentRotateX = Math.round((baseTiltX + mouseTiltX) * 10) / 10;
  const currentRotateY = Math.round(mouseTiltY * 10) / 10;

  const copyEndpoint = async () => {
    await copyToClipboard(`${API_BASE_URL}${activeTab.endpoint}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      suppressHydrationWarning
      className="relative w-full max-w-4xl mx-auto perspective-1200 py-2 sm:py-6 select-none overflow-hidden sm:overflow-visible px-0"
    >
      {/* Dynamic 3D Card */}
      <div
        ref={cardRef}
        suppressHydrationWarning
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: mounted
            ? `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) translateZ(0)`
            : "none",
          transition: isHovering ? "transform 0.1s ease-out" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="preserve-3d relative rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/80 p-3 sm:p-6 transition-shadow hover:shadow-orange-950/20"
      >
        {/* Layer 0: Subtle Orange Accent Top Glow Line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />

        {/* Layer 1: Floating Badge (translateZ: 38px) */}
        <div
          style={{ transform: "translateZ(38px)" }}
          className="preserve-3d absolute -top-3.5 right-4 sm:right-6 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-orange-500/40 text-orange-400 text-xs font-mono font-medium shadow-lg"
        >
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span>Interactive 3D Perspective</span>
        </div>

        {/* Layer 2: Console Header (translateZ: 24px) */}
        <div
          style={{ transform: "translateZ(24px)" }}
          className="preserve-3d flex items-center justify-between gap-2 pb-2.5 sm:pb-4 border-b border-zinc-800/80"
        >
          {/* Terminal dots & Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700/80 border border-zinc-600/40" />
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700/80 border border-zinc-600/40" />
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-orange-600/80 border border-orange-500/40" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs text-zinc-400">
              <span className="text-zinc-200 font-semibold truncate max-w-[120px] sm:max-w-none">free-api</span>
              <span className="text-zinc-600">/</span>
              <span className="text-orange-400">v1.0</span>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 sm:p-1 rounded-lg border border-zinc-800 text-[10px] sm:text-xs font-mono">
            {DEMO_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab)}
                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded transition-colors ${
                  activeTab.id === tab.id
                    ? "bg-orange-600 text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {tab.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Layer 3: Request Endpoint Bar (translateZ: 32px) */}
        <div
          style={{ transform: "translateZ(32px)" }}
          className="preserve-3d mt-2.5 sm:mt-4 flex items-center justify-between gap-2 p-2 sm:p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 font-mono text-[10px] sm:text-xs"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden min-w-0">
            <span className="px-1.5 py-0.5 rounded font-bold text-[9px] sm:text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30 shrink-0">
              {activeTab.method}
            </span>
            <span className="text-zinc-300 truncate text-[10px] sm:text-xs">
              <span className="hidden sm:inline">{API_BASE_URL}</span>
              <span className="text-orange-300 font-medium">{activeTab.endpoint}</span>
            </span>
          </div>

          <button
            onClick={copyEndpoint}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-[10px] sm:text-xs shrink-0"
            title="Copy URL"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-orange-400" />
                <span className="text-orange-400 hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Layer 4: Response Payload / Preview Body (translateZ: 28px) */}
        <div
          style={{ transform: "translateZ(28px)" }}
          className="preserve-3d mt-2.5 sm:mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5 sm:p-4"
        >
          {/* Status info bar */}
          <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-800/60 mb-2.5 sm:mb-3">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {activeTab.status} OK
              </span>
              <span className="text-zinc-600">•</span>
              <span className="truncate">Type: <strong className="text-zinc-300">{activeTab.type}</strong></span>
            </div>
            <div className="text-orange-400 font-medium shrink-0">
              {activeTab.time}
            </div>
          </div>

          {/* Body Content Preview */}
          {activeTab.previewType === "brat" ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 py-1 sm:py-2">
              {/* Asset brat-demo.png provided by user in public folder */}
              <div className="relative w-28 h-28 sm:w-44 sm:h-44 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/60 shadow-md shrink-0 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brat-demo.png"
                  alt="Brat Meme Sticker Asset"
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                />
                <span className="absolute bottom-1 right-1 text-[8px] sm:text-[9px] font-mono bg-black/80 text-orange-400 px-1 py-0.5 rounded border border-orange-500/30">
                  brat-demo.png
                </span>
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left w-full text-xs font-mono">
                <p className="text-zinc-200 font-semibold text-xs sm:text-sm">Direct PNG Meme Generator</p>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-relaxed">
                  Stiker di atas dibuat menggunakan font Arial dengan efek blur khas album Brat Charli XCX dari asset <code className="text-orange-400 font-bold">public/brat-demo.png</code>.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <a
                    href={`${API_BASE_URL}/api/maker/brat?text=365+party+girl`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] sm:text-xs font-medium transition-colors"
                  >
                    <span>Coba Raw Generator</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <pre className="text-[10px] sm:text-xs font-mono text-zinc-300 overflow-x-auto max-h-36 sm:max-h-48 p-2 rounded bg-zinc-950/70 border border-zinc-800/60 leading-relaxed text-left">
              {JSON.stringify(activeTab.json, null, 2)}
            </pre>
          )}
        </div>

        {/* Footer of Card */}
        <div
          style={{ transform: "translateZ(18px)" }}
          className="preserve-3d mt-2.5 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] sm:text-[11px] text-zinc-500 font-mono text-center sm:text-left"
        >
          <span className="hidden sm:inline">Scroll ke bawah untuk melihat efek rotasi 3D</span>
          <span className="text-orange-400">Dual-Tone Dark & Orange</span>
        </div>
      </div>
    </div>
  );
}
