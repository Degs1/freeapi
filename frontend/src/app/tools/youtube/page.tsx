"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Download, Music, Video, Terminal, ShieldCheck, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/config";

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface FormatInfo {
  itag: number;
  quality: string;
  resolution: string;
  mime_type: string;
  container: string;
  format_type: string;
  has_video: boolean;
  has_audio: boolean;
  approx_size: string;
  direct_url: string;
}

interface VideoMetadata {
  id: string;
  title: string;
  author: string;
  duration: string;
  duration_seconds: number;
  thumbnail: string;
  formats: FormatInfo[];
}

const SAMPLE_URLS = [
  { label: "Rick Astley (Classic)", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { label: "Charli xcx - 360", url: "https://www.youtube.com/watch?v=Wj3-kCjF_z0" },
];

export default function YouTubePage() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ytdl/info?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Gagal mengambil data video");
      }

      setVideoData(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memanggil API";
      setError(`${msg}. Pastikan backend FreeAPI berjalan dan dapat diakses!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
            Direct Link Extractor
          </Badge>
          <span className="text-xs text-zinc-400 font-mono">GET /api/ytdl/info</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">YouTube Direct Stream Extractor</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Ekstrak direct CDN streaming URL dari YouTube. Download langsung dari Google CDN ke perangkatmu tanpa perlu disimpan atau diproses di disk server kita.
        </p>
      </div>

      {/* Info Box: How Zero Storage Works */}
      <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-start gap-3 text-xs text-zinc-300">
        <ShieldCheck className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-orange-400">Konsep Zero Server Storage:</span> Backend Go hanya bertindak sebagai parser yang membaca metadata dan mendekripsi direct stream URL (Google Video CDN). Saat tombol unduh ditekan, browser langsung mengambil data dari CDN Google, sehingga server backend kamu tetap hemat RAM dan harddisk 0 MB!
        </div>
      </div>

      {/* Input Form */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="pt-6 space-y-3">
          <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <YoutubeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Tempel link YouTube (contoh: https://www.youtube.com/watch?v=...)"
                className="pl-10 h-11 text-sm font-medium"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-11 px-6 gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Menganalisis..." : "Ekstrak Link"}
            </Button>
          </form>

          {/* Quick Sample Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500">
            <span>Coba contoh cepat:</span>
            {SAMPLE_URLS.map((sample) => (
              <button
                key={sample.url}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
                }}
                className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Display */}
      {videoData && (
        <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Thumbnail & Title */}
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={videoData.thumbnail}
                  alt={videoData.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                  {videoData.duration}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{videoData.title}</h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">{videoData.author}</p>
              </div>
            </div>

            {/* Formats List */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Daftar Format & Direct Link ({videoData.formats.length} Opsi)
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {videoData.formats.map((format, idx) => {
                  const isAudio = format.format_type === "audio_only";
                  const downloadStreamUrl = `${API_BASE_URL}/api/ytdl/download?url=${encodeURIComponent(url)}&itag=${format.itag}`;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isAudio ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                          {isAudio ? <Music className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{format.quality || format.resolution}</span>
                            <Badge variant="outline" className="text-[10px] uppercase py-0">
                              {format.container}
                            </Badge>
                            {format.has_audio && format.has_video && (
                              <Badge variant="secondary" className="text-[9px] py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                Video + Audio
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-zinc-400 font-mono">
                            {format.resolution} • {format.approx_size} • itag: {format.itag}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Option A: Direct CDN link */}
                        {format.direct_url && (
                          <a href={format.direct_url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" className="h-8 text-xs gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Link CDN
                            </Button>
                          </a>
                        )}

                        {/* Option B: Direct Stream Pipe with correct filename */}
                        <a href={downloadStreamUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 font-medium">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Developer API Playground */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Developer API Playground</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Format endpoint REST API untuk integrasi bot atau script downloader.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl">
            <TabsList className="mb-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>

            <TabsContent value="curl">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`# 1. Ekstrak metadata & daftar direct stream link
curl "${API_BASE_URL}/api/ytdl/info?url=${encodeURIComponent(url)}"`}
              </pre>
            </TabsContent>

            <TabsContent value="javascript">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`// Ambil daftar format & direct CDN URL
const res = await fetch("${API_BASE_URL}/api/ytdl/info?url=" + encodeURIComponent("${url}"));
const json = await res.json();
console.log("Judul Video:", json.data.title);
console.log("Direct URL 720p:", json.data.formats[0].direct_url);`}
              </pre>
            </TabsContent>

            <TabsContent value="python">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`import requests

# Ambil direct link dari server Go
res = requests.get("${API_BASE_URL}/api/ytdl/info", params={"url": "${url}"}).json()
data = res["data"]
print("Judul:", data["title"])
print("Pilihan format:", len(data["formats"]))
print("Direct Stream CDN:", data["formats"][0]["direct_url"])`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
