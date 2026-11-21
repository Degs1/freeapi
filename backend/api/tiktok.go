package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"free-api/lib/tiktok"
)

// TikTokHandler menangani request ekstraksi video atau slide foto TikTok
func TikTokHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Parameter query 'url' wajib diisi. Contoh: /api/download/tiktok?url=https://vt.tiktok.com/xxxx/",
		})
		return
	}

	data, err := tiktok.ExtractTikTok(targetURL)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: fmt.Sprintf("Gagal mengekstrak TikTok: %v", err),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Data TikTok berhasil diekstrak",
		Data:    data,
	})
}

// MediaProxyHandler mengalirkan file media (video/audio/image) langsung dengan header attachment tanpa simpan ke harddisk
func MediaProxyHandler(w http.ResponseWriter, r *http.Request) {
	mediaURL := r.URL.Query().Get("url")
	if mediaURL == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Parameter 'url' wajib diisi",
		})
		return
	}

	filename := r.URL.Query().Get("filename")
	if filename == "" {
		filename = "download_media"
	}

	// Buat request ke URL CDN target
	req, err := http.NewRequest("GET", mediaURL, nil)
	if err != nil {
		http.Error(w, "URL media tidak valid", http.StatusBadRequest)
		return
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", "https://www.tiktok.com/")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Gagal mengambil media: %v", err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		if strings.HasSuffix(filename, ".mp4") {
			contentType = "video/mp4"
		} else if strings.HasSuffix(filename, ".mp3") {
			contentType = "audio/mpeg"
		} else if strings.HasSuffix(filename, ".jpg") || strings.HasSuffix(filename, ".jpeg") {
			contentType = "image/jpeg"
		} else {
			contentType = "application/octet-stream"
		}
	}

	// Atur header download langsung di browser
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, url.PathEscape(filename)))
	if resp.ContentLength > 0 {
		w.Header().Set("Content-Length", fmt.Sprintf("%d", resp.ContentLength))
	}

	// Alirkan stream byte langsung ke client (Zero Server Storage)
	io.Copy(w, resp.Body)
}
