"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Download,
  Music,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Play,
  Disc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/config";

interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  preview_audio?: string;
  download_url: string;
  download_stream: string;
  approx_size?: string;
  matched_youtube?: string;
}

const SAMPLE_TRACKS = [
  { label: "Rick Astley (Track URL)", query: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" },
  { label: "Charli xcx - 360", query: "Charli xcx 360" },
];

export default function SpotifyPage() {
  const [query, setQuery] = useState("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/download/spotify?url=${encodeURIComponent(query.trim())}`);
      const json = await res.json();

      if (!res.ok || json.status === "error") {
        throw new Error(json.message || "Gagal mengambil lagu Spotify");
      }

      setTrack(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memanggil API";
      setError(`${msg}. Pastikan link/judul valid dan backend FreeAPI berjalan!`);
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
            Music Downloader
          </Badge>
          <span className="text-xs text-zinc-400 font-mono">GET /api/download/spotify</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Spotify Music Downloader</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Cari lagu atau tempel link Spotify untuk mendapatkan metadata cover art HD dan download audio lagu kualitas jernih secara instan.
        </p>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-start gap-3 text-xs text-zinc-300">
        <ShieldCheck className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-orange-400">Metadata Resmi & Audio Full:</span> Sistem mengambil cover art asli beresolusi tinggi langsung dari Spotify, lalu mencocokkan audio lagu lengkap tanpa kompresi DRM secara otomatis.
        </div>
      </div>

      {/* Input Form */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="pt-6 space-y-3">
          <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Music className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tempel link Spotify (https://open.spotify.com/track/...) atau ketik judul lagu..."
                className="pl-10 h-11 text-sm font-medium"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="h-11 px-6 gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Mencari Lagu..." : "Cari & Ekstrak"}
            </Button>
          </form>

          {/* Quick Sample Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500">
            <span>Contoh cepat:</span>
            {SAMPLE_TRACKS.map((sample) => (
              <button
                key={sample.query}
                type="button"
                onClick={() => setQuery(sample.query)}
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
      {track && (
        <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Cover Art */}
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md shrink-0 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.cover || "/album-placeholder.png"}
                  alt={track.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-orange-400 backdrop-blur-sm">
                  <Disc className="h-4 w-4 animate-spin" style={{ animationDuration: "8s" }} />
                </div>
              </div>

              {/* Track Details & Action */}
              <div className="space-y-4 flex-1 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
                    {track.title}
                  </h3>
                  <p className="text-sm font-semibold text-orange-400 mt-1">
                    {track.artist || "Unknown Artist"}
                  </p>
                  {track.album && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Album: <span className="font-medium text-zinc-600 dark:text-zinc-300">{track.album}</span>
                    </p>
                  )}
                  {track.approx_size && (
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Ukuran File: {track.approx_size}
                    </p>
                  )}
                </div>

                {/* Audio Preview if available */}
                {track.preview_audio && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Preview Resmi Spotify (30 Detik):
                    </span>
                    <audio controls className="w-full h-8" src={track.preview_audio}>
                      Browser kamu tidak mendukung pemutar audio.
                    </audio>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-2">
                  <a
                    href={`${API_BASE_URL}${track.download_stream}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button className="gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold">
                      <Download className="h-4 w-4" />
                      Download Lagu Penuh (MP3)
                    </Button>
                  </a>

                  {track.download_url && (
                    <a href={track.download_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="gap-1.5 text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Link Direct CDN
                      </Button>
                    </a>
                  )}

                  {track.cover && (
                    <a href={track.cover} target="_blank" rel="noreferrer">
                      <Button variant="ghost" className="text-xs">
                        Buka Cover HD
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
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
            Endpoint ini bisa kamu panggil dengan link lagu Spotify maupun keyword judul lagu.
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
                {`# Cari & unduh lagu Spotify
curl "${API_BASE_URL}/api/download/spotify?url=${encodeURIComponent(query)}"`}
              </pre>
            </TabsContent>

            <TabsContent value="javascript">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`const res = await fetch("${API_BASE_URL}/api/download/spotify?url=" + encodeURIComponent("${query}"));
const json = await res.json();
console.log("Judul:", json.data.title);
console.log("Artist:", json.data.artist);
console.log("Download Audio Stream:", "${API_BASE_URL}" + json.data.download_stream);`}
              </pre>
            </TabsContent>

            <TabsContent value="python">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`import requests

url = "${API_BASE_URL}/api/download/spotify"
res = requests.get(url, params={"url": "${query}"}).json()
data = res["data"]
print("Title:", data["title"])
print("Artist:", data["artist"])
print("Download MP3:", "${API_BASE_URL}" + data["download_stream"])`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
