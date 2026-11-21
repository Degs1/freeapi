"use client";

import { useState } from "react";
import {
  ChevronDown,
  Play,
  Copy,
  Check,
  Download,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Code2,
  Terminal,
  Music,
  Video,
  Image as ImageIcon,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/config";
import { copyToClipboard } from "@/lib/clipboard";

interface ParamDef {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string;
  description: string;
}

interface EndpointDef {
  id: string;
  method: "GET" | "POST";
  path: string;
  category: "Meme Maker" | "Media Downloader" | "Analytics" | "System Health";
  title: string;
  description: string;
  params: ParamDef[];
  contentType: "image/png" | "application/json";
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: "brat",
    method: "GET",
    path: "/api/maker/brat",
    category: "Meme Maker",
    title: "Brat Sticker Generator",
    description: "Generate gambar/stiker meme dengan font & visual blur khas album Brat Charli XCX secara real-time. Menghasilkan raw binary image PNG tanpa menyimpan file ke storage server.",
    params: [
      {
        name: "text",
        type: "string",
        required: false,
        defaultValue: "kamu nanya?",
        description: "Teks yang ingin dicetak di atas kanvas stiker Brat (default: 'brat')",
      },
    ],
    contentType: "image/png",
  },
  {
    id: "tiktok",
    method: "GET",
    path: "/api/download/tiktok",
    category: "Media Downloader",
    title: "TikTok Video & Carousel Downloader",
    description: "Ekstrak video TikTok kualitas HD tanpa watermark. Mendukung juga post mode carousel/slide (semua gambar diekstrak satu per satu) serta file audio MP3 latar belakang.",
    params: [
      {
        name: "url",
        type: "string",
        required: true,
        defaultValue: "https://vt.tiktok.com/ZSjVqQxWv/",
        description: "URL video atau postingan foto TikTok (vt.tiktok.com atau tiktok.com/@user/video/...)",
      },
    ],
    contentType: "application/json",
  },
  {
    id: "youtube-info",
    method: "GET",
    path: "/api/ytdl/info",
    category: "Media Downloader",
    title: "YouTube Metadata & Direct Streams",
    description: "Ambil informasi judul, durasi, thumbnail, channel author, dan direct streaming link untuk video dan audio YouTube tanpa perlu buffering ke server backend kita.",
    params: [
      {
        name: "url",
        type: "string",
        required: true,
        defaultValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "URL video YouTube lengkap atau format singkat (youtu.be/xxx)",
      },
    ],
    contentType: "application/json",
  },
  {
    id: "instagram",
    method: "GET",
    path: "/api/download/instagram",
    category: "Media Downloader",
    title: "Instagram Reels & Post Extractor",
    description: "Unduh konten Instagram meliputi video Reels, single post feed foto, dan album multi-foto carousel dalam resolusi tinggi.",
    params: [
      {
        name: "url",
        type: "string",
        required: true,
        defaultValue: "https://www.instagram.com/reel/C8xxxxxxxx/",
        description: "URL tautan video Reels atau postingan Instagram",
      },
    ],
    contentType: "application/json",
  },
  {
    id: "spotify",
    method: "GET",
    path: "/api/download/spotify",
    category: "Media Downloader",
    title: "Spotify Track & Audio Matcher",
    description: "Cari judul lagu atau tempel link Spotify. Mengambil metadata cover art resmi, audio preview 30 detik, serta pencarian otomatis direct streaming lagu full.",
    params: [
      {
        name: "q",
        type: "string",
        required: false,
        defaultValue: "kamu nanya",
        description: "Kata kunci pencarian judul lagu / nama artis (jika tidak memakai url)",
      },
      {
        name: "url",
        type: "string",
        required: false,
        defaultValue: "",
        description: "Link URL track Spotify resmi (contoh: https://open.spotify.com/track/...)",
      },
    ],
    contentType: "application/json",
  },
  {
    id: "stats",
    method: "GET",
    path: "/api/stats",
    category: "Analytics",
    title: "MongoDB Telemetry & API Usage Stats",
    description: "Menampilkan metrik agregat penggunaan tools yang tercatat secara asynchronous di MongoDB, status konektivitas database, dan riwayat request terakhir.",
    params: [],
    contentType: "application/json",
  },
  {
    id: "status",
    method: "GET",
    path: "/api/status",
    category: "System Health",
    title: "Backend Server Health & Uptime",
    description: "Pemeriksaan health check kondisi server Golang: uptime, sistem operasi, status engine, dan waktu respons.",
    params: [],
    contentType: "application/json",
  },
];

export function ApiExplorer() {
  const [openId, setOpenId] = useState<string>("brat");
  const [paramValues, setParamValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    for (const ep of ENDPOINTS) {
      initial[ep.id] = {};
      for (const p of ep.params) {
        initial[ep.id][p.name] = p.defaultValue;
      }
    }
    return initial;
  });

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<
    Record<
      string,
      {
        status: number;
        statusText: string;
        time: number;
        contentType: string;
        data?: any;
        imageUrl?: string;
        error?: string;
      }
    >
  >({});

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const toggleEndpoint = (id: string) => {
    setOpenId((prev) => (prev === id ? "" : id));
  };

  const handleParamChange = (endpointId: string, paramName: string, value: string) => {
    setParamValues((prev) => ({
      ...prev,
      [endpointId]: {
        ...prev[endpointId],
        [paramName]: value,
      },
    }));
  };

  const buildQueryUrl = (endpoint: EndpointDef) => {
    const params = paramValues[endpoint.id] || {};
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v.trim() !== "") {
        query.append(k, v.trim());
      }
    }
    const queryString = query.toString();
    return `${API_BASE_URL}${endpoint.path}${queryString ? `?${queryString}` : ""}`;
  };

  const handleExecute = async (endpoint: EndpointDef) => {
    const url = buildQueryUrl(endpoint);
    setLoading((prev) => ({ ...prev, [endpoint.id]: true }));
    const startTime = performance.now();

    try {
      const res = await fetch(url);
      const duration = Math.round(performance.now() - startTime);

      if (endpoint.contentType === "image/png" && res.ok) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setResults((prev) => ({
          ...prev,
          [endpoint.id]: {
            status: res.status,
            statusText: res.statusText || "OK",
            time: duration,
            contentType: "image/png",
            imageUrl: objectUrl,
          },
        }));
      } else {
        const json = await res.json().catch(() => null);
        setResults((prev) => ({
          ...prev,
          [endpoint.id]: {
            status: res.status,
            statusText: res.statusText || (res.ok ? "OK" : "Error"),
            time: duration,
            contentType: "application/json",
            data: json,
            error: !res.ok ? json?.message || "Server mengembalikan status error" : undefined,
          },
        }));
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setResults((prev) => ({
        ...prev,
        [endpoint.id]: {
          status: 0,
          statusText: "Connection Failed",
          time: duration,
          contentType: "error",
          error: `Gagal terhubung ke backend Go (${API_BASE_URL}). Pastikan server backend sedang dijalankan.`,
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [endpoint.id]: false }));
    }
  };

  const copyCurl = async (endpoint: EndpointDef) => {
    const url = buildQueryUrl(endpoint);
    const curl = `curl -X GET "${url}"`;
    await copyToClipboard(curl);
    setCopiedUrl(endpoint.id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div id="endpoints" suppressHydrationWarning className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-medium mb-2">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>Interactive REST Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            Daftar Endpoint & Live Console
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Klik baris endpoint untuk membuka dokumentasi parameter, masukkan parameter kamu, dan tekan{" "}
            <span className="text-orange-400 font-semibold">Try Now</span> untuk menjalankan live request.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span>Gateway: <strong className="text-zinc-200">{API_BASE_URL}</strong></span>
        </div>
      </div>

      {/* Vertical Stacked API List (Accordion) */}
      <div className="space-y-3">
        {ENDPOINTS.map((endpoint) => {
          const isOpen = openId === endpoint.id;
          const isLoading = loading[endpoint.id] || false;
          const result = results[endpoint.id];
          const hasCopied = copiedUrl === endpoint.id;

          return (
            <div
              key={endpoint.id}
              className={`rounded-xl border transition-all duration-200 bg-zinc-950 overflow-hidden ${
                isOpen
                  ? "border-orange-500/40 shadow-lg shadow-orange-950/10"
                  : "border-zinc-800 hover:border-zinc-700/80"
              }`}
            >
              {/* Accordion Row Header */}
              <button
                type="button"
                onClick={() => toggleEndpoint(endpoint.id)}
                className="w-full text-left p-3 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-3 cursor-pointer group hover:bg-zinc-900/40 transition-colors"
              >
                {/* Mobile Top Row / Desktop Left Group */}
                <div className="flex items-center justify-between md:justify-start gap-2 sm:gap-3 overflow-hidden min-w-0 w-full md:w-auto">
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    {/* Method Badge: High-contrast Orange */}
                    <span className="px-1.5 sm:px-2 py-0.5 rounded font-mono font-bold text-[10px] sm:text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 whitespace-nowrap shrink-0">
                      {endpoint.method}
                    </span>

                    {/* Endpoint Path */}
                    <span className="font-mono text-xs sm:text-sm md:text-base font-semibold text-zinc-100 group-hover:text-orange-400 transition-colors truncate">
                      {endpoint.path}
                    </span>

                    {/* Category Pill on Desktop */}
                    <span className="hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 shrink-0">
                      {endpoint.category}
                    </span>
                  </div>

                  {/* Chevron for Mobile Only */}
                  <div
                    className={`md:hidden p-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-orange-400 border-orange-500/40" : "group-hover:text-zinc-200"
                    }`}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Subtitle & Category Row */}
                <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto text-[11px] sm:text-xs text-zinc-400">
                  <span className="truncate max-w-[240px] sm:max-w-xs md:max-w-sm">
                    {endpoint.title}
                  </span>
                  <span className="lg:hidden text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 shrink-0">
                    {endpoint.category}
                  </span>
                  {/* Chevron for Desktop */}
                  <div
                    className={`hidden md:flex p-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-orange-400 border-orange-500/40" : "group-hover:text-zinc-200"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </button>

              {/* Accordion Expandable Body */}
              {isOpen && (
                <div className="border-t border-zinc-800/80 bg-zinc-900/30 p-3 sm:p-5 space-y-4 sm:space-y-5">
                  {/* Description */}
                  <div className="text-sm text-zinc-300 leading-relaxed">
                    {endpoint.description}
                  </div>

                  {/* Query Parameters Section */}
                  {endpoint.params.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Query Parameters
                      </h4>

                      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 divide-y divide-zinc-800/80">
                        {endpoint.params.map((param) => (
                          <div
                            key={param.name}
                            className="p-2.5 sm:p-4 flex flex-col md:flex-row md:items-center gap-2 sm:gap-3 justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <code className="font-mono text-xs sm:text-sm font-semibold text-orange-400">
                                  {param.name}
                                </code>
                                <span className="font-mono text-[9px] sm:text-[10px] text-zinc-500">({param.type})</span>
                                {param.required ? (
                                  <span className="text-[9px] sm:text-[10px] font-semibold text-red-400 uppercase">required</span>
                                ) : (
                                  <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase">optional</span>
                                )}
                              </div>
                              <p className="text-[11px] sm:text-xs text-zinc-400">{param.description}</p>
                            </div>

                            <div className="w-full md:w-72 lg:w-80 shrink-0">
                              <Input
                                value={paramValues[endpoint.id]?.[param.name] ?? ""}
                                onChange={(e) => handleParamChange(endpoint.id, param.name, e.target.value)}
                                placeholder={`Input ${param.name}...`}
                                className="h-8 sm:h-9 font-mono text-xs bg-zinc-900 border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-zinc-100 placeholder:text-zinc-600"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar (Try Now & Copy cURL) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => handleExecute(endpoint)}
                        disabled={isLoading}
                        className="h-8 sm:h-9 gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-[11px] sm:text-xs px-3 sm:px-4 shadow-sm active:scale-95 transition-all w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin text-white" />
                            <span>Mengirim...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-current" />
                            <span>Try Now</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCurl(endpoint)}
                        className="h-8 sm:h-9 gap-1.5 text-[11px] sm:text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white w-full sm:w-auto"
                      >
                        {hasCopied ? (
                          <>
                            <Check className="h-3 w-3 text-orange-400" />
                            <span className="text-orange-400 font-medium">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Salin cURL</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="font-mono text-[10px] sm:text-[11px] text-zinc-500 truncate max-w-full">
                      Endpoint: <span className="text-zinc-400">{buildQueryUrl(endpoint)}</span>
                    </div>
                  </div>

                  {/* Live Results Panel */}
                  {result && (
                    <div className="mt-3 sm:mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-5 space-y-3 sm:space-y-4">
                      {/* Result Header Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800 text-[11px] sm:text-xs font-mono">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <span className="font-bold text-zinc-400">Status:</span>
                          {result.status >= 200 && result.status < 300 ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              {result.status} {result.statusText}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                              {result.status || "ERR"} {result.statusText}
                            </span>
                          )}
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400 truncate">
                            <strong className="text-zinc-200">{result.contentType}</strong>
                          </span>
                        </div>

                        <div className="text-orange-400 font-semibold">
                          {result.time} ms
                        </div>
                      </div>

                      {/* Error Banner */}
                      {result.error && (
                        <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-semibold">{result.error}</p>
                            <p className="text-red-400/80 text-[11px]">
                              Pastikan URL valid atau jalankan backend server dengan perintah <code>go run main.go</code> di port 8000.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Rendered Preview for Brat Image */}
                      {result.imageUrl && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 py-2">
                          <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md w-32 h-32 sm:w-48 sm:h-48 shrink-0">
                            <img
                              src={result.imageUrl}
                              alt="Generated Brat Meme"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] font-mono text-white px-1.5 py-0.5 rounded">
                              500x500 PNG
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3 text-xs text-zinc-300 text-center sm:text-left">
                            <div>
                              <p className="font-semibold text-zinc-100 text-xs sm:text-sm">Stiker Berhasil Dihasilkan!</p>
                              <p className="text-[11px] sm:text-xs text-zinc-400">
                                Gambar dibuat on-the-fly dari font & efek gaussian blur album Brat.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                              <a href={result.imageUrl} download="brat-meme.png">
                                <Button size="sm" className="h-8 gap-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-medium">
                                  <Download className="h-3.5 w-3.5" />
                                  Download PNG
                                </Button>
                              </a>
                              <a href={buildQueryUrl(endpoint)} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Open Raw Image
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rendered Preview for YouTube Downloader */}
                      {result.data?.data?.title && endpoint.id === "youtube-info" && (
                        <div className="p-3 sm:p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-3">
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                            {result.data.data.thumbnail && (
                              <img
                                src={result.data.data.thumbnail}
                                alt={result.data.data.title}
                                className="w-full sm:w-44 h-24 sm:h-28 object-cover rounded border border-zinc-800 shrink-0"
                              />
                            )}
                            <div className="space-y-1 text-xs">
                              <h5 className="font-bold text-zinc-100 text-xs sm:text-sm">{result.data.data.title}</h5>
                              <p className="text-zinc-400 text-[11px] sm:text-xs">Channel: <strong className="text-zinc-200">{result.data.data.author}</strong></p>
                              <p className="text-zinc-400 text-[11px] sm:text-xs">Durasi: <strong className="text-orange-400">{result.data.data.duration}</strong></p>
                              <div className="pt-1.5 flex flex-wrap gap-2">
                                <a
                                  href={`${API_BASE_URL}/api/ytdl/download?url=${encodeURIComponent(
                                    paramValues[endpoint.id]?.url || ""
                                  )}&quality=highest&type=video`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Button size="sm" className="h-8 gap-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white">
                                    <Video className="h-3.5 w-3.5" />
                                    Stream Video MP4
                                  </Button>
                                </a>
                                <a
                                  href={`${API_BASE_URL}/api/ytdl/download?url=${encodeURIComponent(
                                    paramValues[endpoint.id]?.url || ""
                                  )}&type=audio`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                                    <Music className="h-3.5 w-3.5" />
                                    Stream Audio M4A
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rendered Preview for TikTok */}
                      {result.data?.data?.author && endpoint.id === "tiktok" && (
                        <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-3">
                          <div className="flex items-center gap-3">
                            {result.data.data.author.avatar && (
                              <img
                                src={result.data.data.author.avatar}
                                alt="Author avatar"
                                className="w-10 h-10 rounded-full border border-zinc-700"
                              />
                            )}
                            <div className="text-xs">
                              <p className="font-bold text-zinc-100">{result.data.data.author.nickname || result.data.data.author.username}</p>
                              <p className="text-zinc-400 font-mono">@{result.data.data.author.username}</p>
                            </div>
                            <span className="ml-auto text-xs px-2 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 font-mono">
                              Type: {result.data.data.post_type}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-300 font-medium">{result.data.data.title}</p>

                          {/* Media list buttons */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {result.data.data.media?.map((m: any, idx: number) => (
                              <a key={idx} href={m.url} target="_blank" rel="noreferrer">
                                <Button size="sm" className="gap-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white">
                                  {m.type === "video" ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                                  Unduh {m.quality || `Media #${idx + 1}`}
                                </Button>
                              </a>
                            ))}
                            {result.data.data.music?.url && (
                              <a href={result.data.data.music.url} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                                  <Music className="h-3.5 w-3.5" />
                                  Unduh Audio ({result.data.data.music.title || "MP3"})
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rendered Preview for Spotify */}
                      {result.data?.data?.title && endpoint.id === "spotify" && (
                        <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-3">
                          <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {result.data.data.cover && (
                              <img
                                src={result.data.data.cover}
                                alt="Spotify Album Art"
                                className="w-24 h-24 rounded-lg object-cover border border-zinc-800 shrink-0"
                              />
                            )}
                            <div className="space-y-1.5 text-xs w-full">
                              <h5 className="font-bold text-zinc-100 text-sm">{result.data.data.title}</h5>
                              <p className="text-zinc-400">Artis: <strong className="text-zinc-200">{result.data.data.artist}</strong></p>
                              {result.data.data.album && (
                                <p className="text-zinc-500">Album: {result.data.data.album}</p>
                              )}

                              {result.data.data.preview_url && (
                                <div className="pt-1">
                                  <audio controls className="w-full h-8" src={result.data.data.preview_url} />
                                </div>
                              )}

                              <div className="pt-2 flex flex-wrap gap-2">
                                {result.data.data.download_url && (
                                  <a href={result.data.data.download_url} target="_blank" rel="noreferrer">
                                    <Button size="sm" className="gap-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-medium">
                                      <Download className="h-3.5 w-3.5" />
                                      Unduh Lagu Full MP3
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Formatted JSON Tree / Payload Viewer */}
                      {result.data && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                            <span>Raw JSON Response</span>
                            <button
                              onClick={async () => {
                                await copyToClipboard(JSON.stringify(result.data, null, 2));
                              }}
                              className="hover:text-orange-400 transition-colors"
                            >
                              Salin JSON
                            </button>
                          </div>
                          <pre className="text-xs font-mono text-zinc-300 overflow-x-auto max-h-60 p-3 rounded-lg bg-zinc-900/90 border border-zinc-800/80 leading-relaxed text-left">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
