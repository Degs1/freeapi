package api

import (
	"encoding/json"
	"net/http"
)

// Response standar untuk format JSON API
type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

// RootHandler menampilkan informasi selamat datang dan daftar endpoint
func RootHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	info := map[string]any{
		"name":        "Free API Server",
		"version":     "1.0.0",
		"description": "API modular diatur dari package api dan dijalankan lewat main.go",
		"endpoints": []string{
			"GET /",
			"GET /api/status",
			"GET /api/stats",
			"GET /api/maker/brat?text=halo+dunia",
			"GET /api/ytdl/info?url={video_url}",
			"GET /api/ytdl/download?url={video_url}&itag={itag}",
			"GET /api/download/tiktok?url={tiktok_url}",
			"GET /api/download/instagram?url={instagram_url}",
			"GET /api/download/spotify?url={spotify_url}",
			"GET /api/download/proxy?url={media_url}&filename={filename}",
		},
	}

	json.NewEncoder(w).Encode(info)
}
