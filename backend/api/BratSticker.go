package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"free-api/lib/brat"
)

// BratHandler menangani request pembuatan sticker dan langsung mengembalikan bytes gambar ke client
func BratHandler(w http.ResponseWriter, r *http.Request) {
	text := r.URL.Query().Get("text")
	if text == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Parameter query 'text' wajib diisi. Contoh: /api/maker/brat?text=halo",
		})
		return
	}

	// Generate sticker langsung mengembalikan byte PNG di memori (tanpa menulis ke file lokal)
	imgBytes, err := brat.GenerateBratSticker(text)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: fmt.Sprintf("Gagal membuat sticker: %v", err),
		})
		return
	}

	// Kirim response berupa gambar PNG langsung ke client
	w.Header().Set("Content-Type", "image/png")
	w.WriteHeader(http.StatusOK)
	w.Write(imgBytes)
}
