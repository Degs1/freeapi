"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy, Check, Terminal, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/config";

const SAMPLE_TEXTS = ["brat", "kamu nanya?", "gwenchana", "365 party girl", "gabut bgt"];

export default function BratPage() {
  const [text, setText] = useState("kamu nanya?");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const backendApiUrl = `${API_BASE_URL}/api/maker/brat?text=${encodeURIComponent(text || "brat")}`;

  const handleDownload = async () => {
    try {
      setLoading(true);
      const res = await fetch(backendApiUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brat-${text.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Gagal mengunduh. Pastikan backend Go berjalan di port 8000!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(backendApiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Image Generator
          </Badge>
          <span className="text-xs text-zinc-400 font-mono">GET /api/maker/brat</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Brat Sticker Generator</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Buat gambar stiker dengan gaya khas album hijau neon Brat Charli XCX. Cocok buat stiker WA atau meme medsos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Controls Card */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Kustomisasi Teks</CardTitle>
            <CardDescription className="text-xs">
              Ketik teks apa saja, sistem akan langsung membuat gambarnya secara dinamis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Teks Brat
              </label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Masukkan kata-kata..."
                maxLength={40}
                className="font-medium text-base"
              />
              <p className="text-xs text-zinc-400 text-right">{text.length}/40 karakter</p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-xs text-zinc-400">Ide cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_TEXTS.map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setText(sample)}
                    className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={handleDownload}
                disabled={loading || !text.trim()}
                className="w-full gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download Stiker (PNG)
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="w-full gap-2 text-xs"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Link API Disalin!" : "Salin URL Gambar API"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col items-center justify-center space-y-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Live Preview
            </span>

            {/* The Brat Container: 500x500 square preview */}
            <div
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-lg flex items-center justify-center p-6 text-center select-none shadow-inner"
              style={{
                backgroundColor: "#8ACE00",
                color: "#000000",
                fontFamily: "Arial, Helvetica, sans-serif",
                filter: "blur(0.4px)",
              }}
            >
              <span className="text-3xl sm:text-4xl font-normal tracking-tight break-words max-w-full leading-tight">
                {text || "brat"}
              </span>
            </div>

            <p className="text-xs text-zinc-400 text-center">
              Preview di atas mensimulasikan hasil render Go backend dengan font Arial dan background lime.
            </p>
          </div>
        </div>
      </div>

      {/* Developer API Documentation Tab */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Developer API Playground</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Endpoint ini bisa kamu panggil langsung dari script NodeJS, Python, atau bot WhatsApp tanpa autentikasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl">
            <TabsList className="mb-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript / Fetch</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>

            <TabsContent value="curl">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`# Download gambar langsung via cURL
curl -o brat.png "${backendApiUrl}"`}
              </pre>
            </TabsContent>

            <TabsContent value="javascript">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`// Fetch gambar sebagai Blob di Frontend / Node.js
const res = await fetch("${backendApiUrl}");
const imageBlob = await res.blob();
const imageUrl = URL.createObjectURL(imageBlob);`}
              </pre>
            </TabsContent>

            <TabsContent value="python">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                {`import requests

url = "${backendApiUrl}"
response = requests.get(url)

with open("brat.png", "wb") as f:
    f.write(response.content)
print("Sticker tersimpan!")`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

