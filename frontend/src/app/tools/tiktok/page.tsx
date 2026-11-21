"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Download,
  Music,
  Video,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Terminal,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/config";

interface MediaItem {
  type: "video" | "image";
  quality: string;
  url: string;
  size?: string;
}

interface AuthorInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
}

interface MusicInfo {
  id: string;
  title: string;
  author: string;
  url: string;
  cover: string;
  duration: number;
}

interface TikTokData {
  id: string;
  title: string;
  post_type: "video" | "carousel";
  cover: string;
  duration: number;
  author: AuthorInfo;
  music: MusicInfo;
  media: MediaItem[];
  stats: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
}

const SAMPLE_URLS = [
  { label: "Video TikTok (No WM)", url: "https://www.tiktok.com/@tiktok/video/7106594312292453675" },
];

export default function TikTokPage() {
  const [url, setUrl] = useState("https://www.tiktok.com/@tiktok/video/7106594312292453675");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TikTokData | null>(null);

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/download/tiktok?url=${encodeURIComponent(url.trim())}`);
      const json = await res.json();

      if (!res.ok || json.status === "error") {
        throw new Error(json.message || "Gagal mengambil data TikTok");
      }

      setData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memanggil API";
      setError(`${msg}. Pastikan URL TikTok valid dan backend Go berjalan di port 8000!`);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
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
            Media Extractor
          </Badge>
          <span className="text-xs text-zinc-400 font-mono">GET /api/download/tiktok</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">TikTok Downloader (Video & Slide Foto)</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Download video TikTok tanpa watermark dalam resolusi HD, atau ambil semua foto dari post mode slide/carousel beserta musik latarnya.
        </p>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-start gap-3 text-xs text-zinc-300">
        <Zap className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-orange-400">Otomatis Mendeteksi Jenis Post:</span> Backend akan langsung membedakan apakah link berupa video atau slide foto. Untuk post foto, semua gambar beresolusi tinggi diekstrak bersamaan dengan audio MP3 aslinya tanpa simpan file di server.
        </div>
      </div>

      {/* Input Form */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="pt-6 space-y-3">
          <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Tempel link TikTok (contoh: https://vt.tiktok.com/xxxx/ atau video link)"
                className="h-11 text-sm font-medium"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-11 px-6 gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Menganalisis..." : "Ekstrak TikTok"}
            </Button>
          </form>

          {/* Quick Sample Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500">
            <span>Contoh cepat:</span>
            {SAMPLE_URLS.map((sample) => (
              <button
                key={sample.url}
                type="button"
                onClick={() => setUrl(sample.url)}
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
      {data && (
        <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* Author Profile & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.author.avatar || "/avatar.png"}
                  alt={data.author.nickname}
                  className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm leading-tight">{data.author.nickname}</h3>
                  <p className="text-xs text-zinc-500 font-mono">@{data.author.username}</p>
                </div>
              </div>

              {/* Stats Badges */}
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-500" />
                  {formatNumber(data.stats.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                  {formatNumber(data.stats.comments)}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5 text-emerald-500" />
                  {formatNumber(data.stats.shares)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-amber-500" />
                  {formatNumber(data.stats.views)}
                </span>
              </div>
            </div>

            {/* Caption */}
            {data.title && (
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                {data.title}
              </p>
            )}

            {/* Music Card */}
            {data.music && data.music.url && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                    <Music className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{data.music.title || "Original Sound"}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{data.music.author}</p>
                  </div>
                </div>

                <a
                  href={`${API_BASE_URL}/api/download/proxy?url=${encodeURIComponent(data.music.url)}&filename=tiktok_audio.mp3`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 shrink-0">
                    <Download className="h-3.5 w-3.5" />
                    Download Audio MP3
                  </Button>
                </a>
              </div>
            )}

            {/* CASE A: VIDEO POST */}
            {data.post_type === "video" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Pilihan Download Video
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.media.map((item, idx) => {
                    const downloadUrl = `${API_BASE_URL}/api/download/proxy?url=${encodeURIComponent(item.url)}&filename=tiktok_${data.id}_${item.quality.replace(/\s+/g, "_")}.mp4`;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 bg-white dark:bg-zinc-900/50 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{item.quality}</span>
                            {item.size && (
                              <Badge variant="secondary" className="text-[10px]">
                                {item.size}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-zinc-400">Format MP4 HD</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a href={item.url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" className="h-8 text-xs px-2">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          <a href={downloadUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" className="h-8 text-xs gap-1 bg-orange-600 hover:bg-orange-500 text-white font-medium">
                              <Download className="h-3.5 w-3.5" />
                              Unduh
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CASE B: PHOTO SLIDE / CAROUSEL POST */}
            {data.post_type === "carousel" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Post Slide Foto ({data.media.length} Foto)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data.media.map((photo, idx) => {
                    const downloadUrl = `${API_BASE_URL}/api/download/proxy?url=${encodeURIComponent(photo.url)}&filename=tiktok_slide_${idx + 1}.jpeg`;
                    return (
                      <div
                        key={idx}
                        className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-square flex flex-col justify-between"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={`Slide #${idx + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                          <span className="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded self-start">
                            #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1.5 justify-end">
                            <a href={photo.url} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                            <a href={downloadUrl} target="_blank" rel="noreferrer">
                              <Button size="sm" className="h-7 px-2 text-xs gap-1 bg-orange-600 hover:bg-orange-500 text-white font-medium">
                                <Download className="h-3 w-3" />
                                Unduh
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
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
            Integrasikan endpoint ini ke bot WhatsApp, Telegram, atau script kamu.
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
                {`# Ekstrak data TikTok (Video No-Watermark / Slide Foto)
curl "${API_BASE_URL}/api/download/tiktok?url=${encodeURIComponent(url)}"`}
              </pre>
            </TabsContent>

            <TabsContent value="javascript">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`const res = await fetch("${API_BASE_URL}/api/download/tiktok?url=" + encodeURIComponent("${url}"));
const json = await res.json();
console.log("Post Type:", json.data.post_type); // "video" atau "carousel"
console.log("Media Links:", json.data.media);`}
              </pre>
            </TabsContent>

            <TabsContent value="python">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`import requests

url = "${API_BASE_URL}/api/download/tiktok"
res = requests.get(url, params={"url": "${url}"}).json()
data = res["data"]
print("Tipe:", data["post_type"])
if data["post_type"] == "carousel":
    print("Jumlah Foto:", len(data["media"]))
else:
    print("Link Video NoWM:", data["media"][0]["url"])`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
