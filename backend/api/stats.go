package api

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"time"

	"free-api/config"
	"free-api/models"

	"go.mongodb.org/mongo-driver/bson"
)

// RecordToolUsage mencatat pemanggilan tool ke MongoDB secara asynchronous di background
func RecordToolUsage(tool, endpoint, ip, userAgent string, status int, durationMS int64) {
	if !config.IsConnected() {
		return
	}

	// Gunakan goroutine agar tidak memperlambat response time API ke user (0 overhead)
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		logCol := config.GetDB().Collection("usage_logs")
		logEntry := models.UsageLog{
			Tool:       tool,
			Endpoint:   endpoint,
			IP:         ip,
			UserAgent:  userAgent,
			StatusCode: status,
			DurationMS: durationMS,
			Timestamp:  time.Now(),
		}

		logCol.InsertOne(ctx, logEntry)
	}()
}

// StatsHandler menampilkan statistik analitik penggunaan tools dari MongoDB
func StatsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if !config.IsConnected() {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(Response{
			Status:  "success",
			Message: "MongoDB saat ini offline (statistik persisten belum aktif)",
			Data: map[string]any{
				"database_connected": false,
				"mode":               "free-use (unauthenticated)",
				"uptime":             "online",
			},
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	db := config.GetDB()
	logsCol := db.Collection("usage_logs")

	totalRequests, _ := logsCol.CountDocuments(ctx, bson.M{})

	// Hitung penggunaan per tool
	tools := []string{"brat", "youtube", "tiktok", "instagram", "spotify"}
	toolStats := make(map[string]int64)
	for _, t := range tools {
		c, _ := logsCol.CountDocuments(ctx, bson.M{"tool": t})
		toolStats[t] = c
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Statistik penggunaan berhasil diambil",
		Data: map[string]any{
			"database_connected": true,
			"database_name":      db.Name(),
			"mode":               "free-use (unauthenticated)",
			"total_requests":     totalRequests,
			"tools_usage":        toolStats,
		},
	})
}

// getClientIP mengekstrak IP client murni tanpa port, serta mendukung proxy / Cloudflare
func getClientIP(r *http.Request) string {
	// 1. Cloudflare header
	if cfIP := strings.TrimSpace(r.Header.Get("CF-Connecting-IP")); cfIP != "" {
		return cfIP
	}
	// 2. Nginx / Real-IP header
	if realIP := strings.TrimSpace(r.Header.Get("X-Real-IP")); realIP != "" {
		return realIP
	}
	// 3. X-Forwarded-For (ambil IP pertama jika multi-proxy)
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		parts := strings.Split(forwarded, ",")
		first := strings.TrimSpace(parts[0])
		if first != "" {
			return first
		}
	}
	// 4. RemoteAddr default (hapus port misal [::1]:53200 -> ::1, 127.0.0.1:53200 -> 127.0.0.1)
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	return r.RemoteAddr
}

// LoggingMiddleware merekam setiap request API yang masuk
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Deteksi nama tool dari path URL
		path := r.URL.Path
		tool := ""
		if strings.Contains(path, "/api/maker/brat") || strings.Contains(path, "/api/brat") {
			tool = "brat"
		} else if strings.Contains(path, "/api/ytdl") {
			tool = "youtube"
		} else if strings.Contains(path, "/api/download/tiktok") {
			tool = "tiktok"
		} else if strings.Contains(path, "/api/download/instagram") {
			tool = "instagram"
		} else if strings.Contains(path, "/api/download/spotify") {
			tool = "spotify"
		}

		// Jalankan handler utama
		next.ServeHTTP(w, r)

		// Catat ke MongoDB jika path merupakan pemanggilan tool
		if tool != "" {
			duration := time.Since(start).Milliseconds()
			ip := getClientIP(r)
			RecordToolUsage(tool, path, ip, r.UserAgent(), http.StatusOK, duration)
		}
	})
}
