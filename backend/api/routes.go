package api

import (
	"net/http"
)

// EnableCORS menambahkan header CORS agar API bisa diakses dari Frontend Next.js atau client lain
func EnableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// SetupRoutes mendaftarkan semua endpoint dan mengembalikan router dengan middleware CORS & Logging
func SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	// Route informasi server & analitik
	mux.HandleFunc("GET /{$}", RootHandler)
	mux.HandleFunc("GET /api/status", StatusHandler)
	mux.HandleFunc("GET /api/stats", StatsHandler)

	// Route Maker: Brat Sticker Generator
	mux.HandleFunc("GET /api/maker/brat", BratHandler)
	mux.HandleFunc("GET /api/brat", BratHandler) // Alias backward-compatibility

	// Route YouTube Extractor & Stream Downloader
	mux.HandleFunc("GET /api/ytdl/info", YtInfoHandler)
	mux.HandleFunc("GET /api/ytdl/download", YtDownloadHandler)

	// Route TikTok Downloader (Video & Photo Slide) & General Media Proxy
	mux.HandleFunc("GET /api/download/tiktok", TikTokHandler)
	mux.HandleFunc("GET /api/download/proxy", MediaProxyHandler)

	// Route Instagram Downloader (Reels, Feed Photo & Carousel)
	mux.HandleFunc("GET /api/download/instagram", InstagramHandler)

	// Route Spotify Downloader & Audio Stream
	mux.HandleFunc("GET /api/download/spotify", SpotifyHandler)

	return EnableCORS(LoggingMiddleware(mux))
}
