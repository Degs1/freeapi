export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-8 text-center text-sm text-zinc-400">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-zinc-500">
          © 2026 <span className="text-orange-400 font-medium">FreeAPI Suite</span>. Dual-Tone Dark & Orange Developer Playground.
        </p>
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 rounded text-zinc-400">
            Next.js 16 + Tailwind
          </span>
          <span className="text-orange-500">•</span>
          <span className="border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 rounded text-zinc-400">
            Go + MongoDB
          </span>
          <span className="text-orange-500">•</span>
          <span className="text-orange-400 font-semibold">Zero Auth</span>
        </div>
      </div>
    </footer>
  );
}
