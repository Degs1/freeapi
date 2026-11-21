import Link from "next/link";
import {
  Image as ImageIcon,
  ArrowRight,
  Zap,
  Terminal,
  Music,
  Camera,
  Flame,
  Code2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hero3DShowcase } from "@/components/hero-3d-showcase";
import { ApiExplorer } from "@/components/api-explorer";

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const standaloneTools = [
  {
    id: "brat",
    title: "Brat Sticker Generator",
    description: "Generate gambar/stiker meme dengan font & vibe album Brat Charli XCX secara instan dengan blur blur khas.",
    category: "Meme Maker",
    icon: ImageIcon,
    href: "/tools/brat",
    badge: "GET /api/maker/brat",
  },
  {
    id: "tiktok",
    title: "TikTok Downloader",
    description: "Unduh video HD tanpa watermark, serta ekstrak semua foto dari post mode slide/carousel beserta MP3 latar.",
    category: "Media Downloader",
    icon: Zap,
    href: "/tools/tiktok",
    badge: "GET /api/download/tiktok",
  },
  {
    id: "youtube",
    title: "YouTube Downloader",
    description: "Ekstrak direct link streaming video & audio YouTube langsung tanpa perlu unduh ke server perantara kita.",
    category: "Media Downloader",
    icon: YoutubeIcon,
    href: "/tools/youtube",
    badge: "GET /api/ytdl/info",
  },
  {
    id: "instagram",
    title: "Instagram Downloader",
    description: "Ambil video Reels, foto feed, dan album carousel multi-foto dalam resolusi asli.",
    category: "Media Downloader",
    icon: Camera,
    href: "/tools/instagram",
    badge: "GET /api/download/instagram",
  },
  {
    id: "spotify",
    title: "Spotify Downloader",
    description: "Cari lagu atau tempel link Spotify, dapatkan cover HD, preview 30s, dan unduh audio lagu MP3 jernih.",
    category: "Media Downloader",
    icon: Music,
    href: "/tools/spotify",
    badge: "GET /api/download/spotify",
  },
];

export default function Home() {
  return (
    <div suppressHydrationWarning className="container mx-auto px-3 sm:px-6 py-6 sm:py-12 max-w-5xl space-y-10 sm:space-y-16">
      {/* Hero Section */}
      <section suppressHydrationWarning className="text-center space-y-4 sm:space-y-6 pt-1 sm:pt-2">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 text-orange-400 text-[10px] sm:text-xs font-mono font-medium shadow-sm">
          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-orange-500" />
          <span>Dual-Tone Dark & Orange Developer Platform</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 max-w-3xl mx-auto leading-tight">
          Satu Platform API Bebas &{" "}
          <span className="text-orange-500">
            Open Web Tools
          </span>
        </h1>

        <p className="text-xs sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed px-1">
          Kumpulan utilitas seru: dari generator stiker meme Brat, TikTok HD & carousel, direct stream YouTube, Instagram Reels, hingga Spotify track matcher. Tersedia antarmuka web dan endpoint REST siap integrasi tanpa auth.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-1 w-full max-w-xs sm:max-w-none mx-auto">
          <a href="#endpoints" className="w-full sm:w-auto">
            <Button className="h-9 sm:h-11 w-full sm:w-auto gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs sm:text-sm shadow-md">
              <Code2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Jelajahi API Console
            </Button>
          </a>
          <a href="#tools" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-9 sm:h-11 w-full sm:w-auto gap-2 text-xs sm:text-sm border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200"
            >
              Coba Web Tools
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400" />
            </Button>
          </a>
        </div>

        {/* Interactive 3D Perspective Scroll-Driven Card */}
        <div className="pt-3 sm:pt-6">
          <Hero3DShowcase />
        </div>
      </section>

      {/* Section 2: Interactive Stacked API List (Accordion + Try Now) */}
      <section suppressHydrationWarning className="pt-2 sm:pt-4">
        <ApiExplorer />
      </section>

      {/* Section 3: Standalone Web Tools Catalog */}
      <section id="tools" suppressHydrationWarning className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3 pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-100">
              Antarmuka Web Tools
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 sm:mt-1">
              Gunakan langsung melalui tampilan web interaktif lengkap dengan form, preview pemutar, dan tombol download instan.
            </p>
          </div>
          <span className="font-mono text-[10px] sm:text-xs text-orange-400 font-medium">5 Tools Siap Pakai</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {standaloneTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="flex flex-col justify-between border-zinc-800/80 bg-zinc-950 hover:border-orange-500/40 transition-colors group"
              >
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800 text-orange-400 group-hover:bg-orange-500 group-hover:text-zinc-950 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-orange-500/20 bg-orange-500/10 text-orange-400">
                      {tool.badge}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-base text-zinc-100 group-hover:text-orange-400 transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardFooter className="pt-0">
                  <Link href={tool.href} className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between text-xs border-zinc-800 bg-zinc-900/60 hover:bg-orange-600 hover:text-white hover:border-orange-600 text-zinc-300 transition-all"
                    >
                      <span>Buka Tool</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
