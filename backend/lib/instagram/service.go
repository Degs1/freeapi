package instagram

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

// MediaItem menyimpan informasi file media dari Instagram
type MediaItem struct {
	Type      string `json:"type"`      // "video" atau "image"
	URL       string `json:"url"`       // Direct stream / download link
	Thumbnail string `json:"thumbnail,omitempty"`
}

// InstagramData merepresentasikan hasil ekstraksi post Instagram
type InstagramData struct {
	ID          string      `json:"id"`
	Title       string      `json:"title"`
	PostType    string      `json:"post_type"` // "video", "image", atau "carousel"
	Preview     string      `json:"preview,omitempty"`
	Media       []MediaItem `json:"media"`
}

type snapsaveOutput struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    struct {
		Description string `json:"description"`
		Preview     string `json:"preview"`
		Media       []struct {
			URL        string `json:"url"`
			Type       string `json:"type"`
			Thumbnail  string `json:"thumbnail"`
			Resolution string `json:"resolution"`
		} `json:"media"`
	} `json:"data"`
}

// ExtractShortcode mengambil shortcode unik dari URL Instagram
func ExtractShortcode(urlStr string) string {
	re := regexp.MustCompile(`(?:/p/|/reel/|/reels/|/tv/)([a-zA-Z0-9_-]+)`)
	matches := re.FindStringSubmatch(urlStr)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

// ExtractInstagram mengekstrak video Reels, foto feed, atau multi-foto carousel dari Instagram
func ExtractInstagram(targetURL string) (*InstagramData, error) {
	if targetURL == "" {
		return nil, fmt.Errorf("URL Instagram tidak boleh kosong")
	}

	shortcode := ExtractShortcode(targetURL)
	if shortcode == "" {
		return nil, fmt.Errorf("format URL Instagram tidak valid (harus mengandung /p/, /reel/, atau /reels/)")
	}

	cleanURL := fmt.Sprintf("https://www.instagram.com/p/%s/", shortcode)

	nodeScript := fmt.Sprintf(`
		import("snapsave-media-downloader").then(async ({ snapsave }) => {
			try {
				const res = await snapsave("%s");
				console.log(JSON.stringify(res));
			} catch (err) {
				console.log(JSON.stringify({ success: false, message: err.message }));
			}
		});
	`, cleanURL)

	frontendPath, _ := filepath.Abs("../frontend")
	cmd := exec.Command("node", "--input-type=module", "-e", nodeScript)
	cmd.Dir = frontendPath

	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("gagal menjalankan parser Instagram: %w", err)
	}

	var res snapsaveOutput
	if err := json.Unmarshal(out, &res); err != nil {
		return nil, fmt.Errorf("gagal parse output Instagram: %w (raw: %s)", err, string(out))
	}

	if !res.Success {
		msg := res.Message
		if msg == "" {
			msg = "Konten Instagram tidak ditemukan atau akun diatur ke privat"
		}
		return nil, fmt.Errorf("%s", msg)
	}

	data := &InstagramData{
		ID:       shortcode,
		Title:    res.Data.Description,
		Preview:  res.Data.Preview,
		PostType: "video",
	}

	for _, item := range res.Data.Media {
		mediaType := strings.ToLower(item.Type)
		if mediaType == "" {
			mediaType = "video"
		}
		data.Media = append(data.Media, MediaItem{
			Type:      mediaType,
			URL:       item.URL,
			Thumbnail: item.Thumbnail,
		})
	}

	// Tentukan tipe post berdasarkan jumlah media
	if len(data.Media) > 1 {
		data.PostType = "carousel"
	} else if len(data.Media) == 1 {
		data.PostType = data.Media[0].Type
	}

	return data, nil
}
