"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Download,
  Video,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Camera,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/config";

interface MediaItem {
  type: "video" | "image";
  url: string;
  thumbnail?: string;
}

interface InstagramData {
  id: string;
  title: string;
  post_type: "video" | "image" | "carousel";
  preview?: string;
  media: MediaItem[];
}

const SAMPLE_URLS = [
  { label: "Instagram Reel", url: "https://www.instagram.com/reel/DI8hiYeKUMe/" },
];

export default function InstagramPage() {
  const [url, setUrl] = useState("https://www.instagram.com/reel/DI8hiYeKUMe/");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InstagramData | null>(null);

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/download/instagram?url=${encodeURIComponent(url.trim())}`);
      const json = await res.json();

      if (!res.ok || json.status === "error") {
        throw new Error(json.message || "Gagal mengambil data Instagram");
      }

      setData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memanggil API";
      setError(`${msg}. Pastikan URL Instagram publik dan backend FreeAPI berjalan!`);
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
            Media Extractor
          </Badge>
          <span className="text-xs text-zinc-400 font-mono">GET /api/download/instagram</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Instagram Downloader (Reels, Feed & Carousel)</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Download video Reels, foto feed, dan album carousel multi-foto dalam kualitas resolusi tinggi tanpa perlu login.
        </p>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-start gap-3 text-xs text-zinc-300">
        <ShieldCheck className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-orange-400">Mendukung Multi-Media Carousel:</span> Sistem otomatis mendeteksi apakah link berupa video tunggal, satu foto, atau postingan album slide (carousel) yang berisi banyak foto/video sekaligus.
        </div>
      </div>

      {/* Input Form */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="pt-6 space-y-3">
          <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Tempel link Instagram (contoh: https://www.instagram.com/reel/xxxx/ atau /p/xxxx/)"
                className="pl-10 h-11 text-sm font-medium"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-11 px-6 gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Menganalisis..." : "Ekstrak Media"}
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
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 uppercase text-[11px]">
                  {data.post_type}
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">ID: {data.id}</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {data.media.length} File Tersedia
              </span>
            </div>

            {/* Caption */}
            {data.title && (
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium line-clamp-3">
                {data.title}
              </p>
            )}

            {/* CASE A: SINGLE VIDEO / REEL */}
            {data.post_type === "video" && data.media.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Video Reel Tersedia
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Video MP4 HD</h4>
                      <p className="text-xs text-zinc-400">Resolusi kualitas asli tanpa kompresi</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <a href={data.media[0].url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="ghost" className="h-9 text-xs px-3">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Buka
                      </Button>
                    </a>
                    <a
                      href={`${API_BASE_URL}/api/download/proxy?url=${encodeURIComponent(data.media[0].url)}&filename=instagram_${data.id}.mp4`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" className="h-9 px-4 text-xs gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-medium">
                        <Download className="h-3.5 w-3.5" />
                        Download Video
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* CASE B: SINGLE PHOTO */}
            {data.post_type === "image" && data.media.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Foto Feed
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.media[0].url}
                      alt="Instagram Feed Photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div>
                      <h4 className="font-semibold text-sm">Foto Resolusi Penuh</h4>
                      <p className="text-xs text-zinc-400">Format JPEG HD</p>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <a href={data.media[0].url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Buka Asli
                        </Button>
                      </a>
                      <a
                        href={`${API_BASE_URL}/api/download/proxy?url=${encodeURIComponent(data.media[0].url)}&filename=instagram_${data.id}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="sm" className="h-8 text-xs gap-1 bg-orange-600 hover:bg-orange-500 text-white">
                          <Download className="h-3 w-3" />
                          Unduh Foto
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CASE C: CAROUSEL (SLIDE MULTI-FOTO / MULTI-VIDEO) */}
            {data.post_type === "carousel" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Album Carousel ({data.media.length} File)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data.media.map((item, idx) => {
                    const isVid = item.type === "video";
                    const ext = isVid ? "mp4" : "jpg";
                    const downloadUrl = `${API_BASE_URL}/api/download/proxy?url=${encodeURIComponent(item.url)}&filename=instagram_${data.id}_${idx + 1}.${ext}`;

                    return (
                      <div
                        key={idx}
                        className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-square flex flex-col justify-between"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail || item.url}
                          alt={`Slide #${idx + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            <Badge variant="secondary" className="text-[9px] uppercase py-0 bg-black/60 text-white border-0">
                              {item.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <a href={item.url} target="_blank" rel="noreferrer">
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
            Format endpoint REST API untuk integrasi bot WhatsApp, Discord, atau script otomatis.
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
                {`# Ekstrak data Instagram (Reels / Foto / Carousel)
curl "${API_BASE_URL}/api/download/instagram?url=${encodeURIComponent(url)}"`}
              </pre>
            </TabsContent>

            <TabsContent value="javascript">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`const res = await fetch("${API_BASE_URL}/api/download/instagram?url=" + encodeURIComponent("${url}"));
const json = await res.json();
console.log("Post Type:", json.data.post_type);
console.log("Daftar Media:", json.data.media);`}
              </pre>
            </TabsContent>

            <TabsContent value="python">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`import requests

url = "${API_BASE_URL}/api/download/instagram"
res = requests.get(url, params={"url": "${url}"}).json()
data = res["data"]
print("Tipe:", data["post_type"])
print("Media Count:", len(data["media"]))
print("Download Link:", data["media"][0]["url"])`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
