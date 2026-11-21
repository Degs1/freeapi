package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"free-api/lib/ytdl"
)

// YtInfoHandler menangani ekstraksi metadata dan tautan direct stream dari video YouTube
func YtInfoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	videoURL := r.URL.Query().Get("url")
	if videoURL == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Parameter query 'url' wajib diisi. Contoh: /api/ytdl/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		})
		return
	}

	info, err := ytdl.ExtractVideoInfo(videoURL)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: fmt.Sprintf("Gagal mengekstrak video: %v", err),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Metadata dan link video berhasil diekstrak",
		Data:    info,
	})
}

// YtDownloadHandler melakukan streaming langsung dari YouTube ke browser user tanpa simpan ke harddisk server
func YtDownloadHandler(w http.ResponseWriter, r *http.Request) {
	videoURL := r.URL.Query().Get("url")
	if videoURL == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Parameter query 'url' wajib diisi",
		})
		return
	}

	itagStr := r.URL.Query().Get("itag")
	itag := 0
	if itagStr != "" {
		if parsed, err := strconv.Atoi(itagStr); err == nil {
			itag = parsed
		}
	}

	stream, size, mimeType, filename, err := ytdl.GetStreamReader(videoURL, itag)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: fmt.Sprintf("Gagal memulai stream download: %v", err),
		})
		return
	}
	defer stream.Close()

	// Header untuk file download langsung di browser
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	if mimeType != "" {
		w.Header().Set("Content-Type", mimeType)
	} else {
		w.Header().Set("Content-Type", "application/octet-stream")
	}
	if size > 0 {
		w.Header().Set("Content-Length", strconv.FormatInt(size, 10))
	}

	// Alirkan langsung byte dari YouTube ke client
	if _, err := io.Copy(w, stream); err != nil {
		// Log error jika koneksi terputus saat streaming
		return
	}
}
