package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"free-api/lib/spotify"
)

// SpotifyHandler menangani ekstraksi metadata dan unduhan audio lagu Spotify
func SpotifyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	input := r.URL.Query().Get("url")
	if input == "" {
		input = r.URL.Query().Get("q")
	}

	if input == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Parameter query 'url' atau 'q' wajib diisi. Contoh: /api/download/spotify?url=https://open.spotify.com/track/xxxx",
		})
		return
	}

	track, err := spotify.ExtractSpotify(input)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: fmt.Sprintf("Gagal mengekstrak lagu Spotify: %v", err),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Metadata dan link audio lagu berhasil diekstrak",
		Data:    track,
	})
}
