package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"free-api/lib/instagram"
)

// InstagramHandler menangani request ekstraksi video Reels, foto feed, dan multi-foto carousel dari Instagram
func InstagramHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Parameter query 'url' wajib diisi. Contoh: /api/download/instagram?url=https://www.instagram.com/reel/xxxx/",
		})
		return
	}

	data, err := instagram.ExtractInstagram(targetURL)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: fmt.Sprintf("Gagal mengekstrak Instagram: %v", err),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Data Instagram berhasil diekstrak",
		Data:    data,
	})
}
