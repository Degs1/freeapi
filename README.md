# FreeAPI ⚡

Free, high-performance REST API & Web Tools gateway built with **Go** and **Next.js 15 (React 19, Tailwind CSS v4, shadcn/ui)**.

## 🚀 Features

- **Brat Generator** (`/api/maker/brat`): Dynamic Brat-style album cover generator with word wrapping and high-resolution PNG rendering.
- **TikTok Downloader** (`/api/download/tiktok`): Extract HD No-Watermark MP4 videos and full photo carousel slides.
- **YouTube Downloader** (`/api/ytdl/info` & `/api/ytdl/download`): Video metadata extraction and direct audio/video format streaming.
- **Instagram Downloader** (`/api/download/instagram`): High-definition video, image, and album carousel scraper.
- **Spotify Downloader** (`/api/download/spotify`): Track search, high-res album art metadata, and MP3 audio stream delivery.
- **Usage Statistics** (`/api/stats`): Async MongoDB logging with zero latency overhead.
- **Interactive Web Interface**: Dual-tone dark/orange UI, interactive 3D perspective scroll, API explorer with live testing, and full mobile responsiveness.

---

## 🛠️ Tech Stack

- **Backend**: Go 1.24+ (Standard `net/http`, Go MongoDB Driver)
- **Frontend**: Next.js 16 (Turbopack, React 19, Tailwind CSS v4, Lucide Icons, shadcn/ui)
- **Database**: MongoDB (Usage Logs & Tool Analytics)

---

## ⚙️ Quick Start

### 1. Backend (Go)

```bash
cd backend

# Copy environment template
cp .env.example .env

# Run backend server (default port 8000)
go run main.go
```

### 2. Frontend (Next.js)

```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Run development server (default port 3000)
npm run dev
```

---

## 📄 License

MIT License. Open-source and free for developers.
