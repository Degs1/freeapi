package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"free-api/api"
	"free-api/config"
)

func main() {
	// 1. Hubungkan ke Database MongoDB
	config.ConnectMongoDB()
	defer config.CloseMongoDB()

	// 2. Inisialisasi router dari package api
	router := api.SetupRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}
	fmt.Printf("🚀 Server berhasil berjalan di http://localhost%s\n\n", port)
	fmt.Println("Daftar Route yang bisa kamu coba:")
	fmt.Printf("  1. Home Info    : http://localhost%s/\n", port)
	fmt.Printf("  2. API Status   : http://localhost%s/api/status\n", port)
	fmt.Printf("  3. DB Stats     : http://localhost%s/api/stats\n", port)
	fmt.Printf("  4. Brat Sticker : http://localhost%s/api/maker/brat?text=kamu+nanya\n", port)
	fmt.Printf("  5. YouTube Info : http://localhost%s/api/ytdl/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ\n", port)
	fmt.Printf("  6. TikTok Info  : http://localhost%s/api/download/tiktok?url=https://vt.tiktok.com/xxxx/\n", port)
	fmt.Printf("  7. Instagram    : http://localhost%s/api/download/instagram?url=https://www.instagram.com/reel/xxxx/\n", port)
	fmt.Printf("  8. Spotify Info : http://localhost%s/api/download/spotify?url=https://open.spotify.com/track/xxxx\n", port)
	fmt.Println("\nTekan Ctrl+C di terminal untuk menghentikan server.")

	// Jalankan HTTP server dengan router dari package api
	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatalf("Server gagal dijalankan: %v\n", err)
	}
}
