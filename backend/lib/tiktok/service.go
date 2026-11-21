package tiktok

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// AuthorInfo menyimpan profil pembuat konten TikTok
type AuthorInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar"`
}

// MusicInfo menyimpan data audio/lagu TikTok
type MusicInfo struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Author   string `json:"author"`
	URL      string `json:"url"`
	Cover    string `json:"cover"`
	Duration int    `json:"duration"`
}

// MediaItem merepresentasikan satu media (video atau foto)
type MediaItem struct {
	Type    string `json:"type"`    // "video" atau "image"
	Quality string `json:"quality"` // "nowm", "hd", "watermark", "photo"
	URL     string `json:"url"`     // Direct stream URL ke CDN ByteDance/Akamai
	Size    string `json:"size,omitempty"`
}

// TikTokData adalah data lengkap post TikTok (video atau photo slide)
type TikTokData struct {
	ID       string           `json:"id"`
	Title    string           `json:"title"`
	PostType string           `json:"post_type"` // "video" atau "carousel"
	Cover    string           `json:"cover"`
	Duration int              `json:"duration"`
	Author   AuthorInfo       `json:"author"`
	Music    MusicInfo        `json:"music"`
	Media    []MediaItem      `json:"media"`
	Stats    map[string]int64 `json:"stats"`
}

type tikwmResponse struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Data struct {
		ID       string `json:"id"`
		Title    string `json:"title"`
		Cover    string `json:"cover"`
		Duration int    `json:"duration"`
		Play     string `json:"play"`
		WmPlay   string `json:"wmplay"`
		HdPlay   string `json:"hdplay"`
		Size     int64  `json:"size"`
		WmSize   int64  `json:"wm_size"`
		HdSize   int64  `json:"hd_size"`
		Music    string `json:"music"`
		MusicInfo struct {
			ID       string `json:"id"`
			Title    string `json:"title"`
			Author   string `json:"author"`
			Play     string `json:"play"`
			Cover    string `json:"cover"`
			Duration int    `json:"duration"`
		} `json:"music_info"`
		PlayCount     int64 `json:"play_count"`
		DiggCount     int64 `json:"digg_count"`
		CommentCount  int64 `json:"comment_count"`
		ShareCount    int64 `json:"share_count"`
		DownloadCount int64 `json:"download_count"`
		Author        struct {
			ID       string `json:"id"`
			UniqueID string `json:"unique_id"`
			Nickname string `json:"nickname"`
			Avatar   string `json:"avatar"`
		} `json:"author"`
		Images []string `json:"images"`
	} `json:"data"`
}

var httpClient = &http.Client{Timeout: 15 * time.Second}

func formatBytes(bytes int64) string {
	if bytes <= 0 {
		return ""
	}
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// ExtractTikTok mengekstrak metadata TikTok (video no-watermark, HD, atau photo slide carousel)
func ExtractTikTok(targetURL string) (*TikTokData, error) {
	if targetURL == "" {
		return nil, fmt.Errorf("URL TikTok tidak boleh kosong")
	}

	endpoint := fmt.Sprintf("https://www.tikwm.com/api/?url=%s&hd=1", url.QueryEscape(targetURL))
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat request: %w", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi parser TikTok: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca response: %w", err)
	}

	var res tikwmResponse
	if err := json.Unmarshal(body, &res); err != nil {
		return nil, fmt.Errorf("gagal parse JSON TikTok: %w", err)
	}

	if res.Code != 0 {
		msg := res.Msg
		if msg == "" {
			msg = "Video TikTok tidak ditemukan atau berstatus privat"
		}
		return nil, fmt.Errorf("%s", msg)
	}

	d := res.Data
	result := &TikTokData{
		ID:       d.ID,
		Title:    d.Title,
		Cover:    d.Cover,
		Duration: d.Duration,
		Author: AuthorInfo{
			ID:       d.Author.ID,
			Username: d.Author.UniqueID,
			Nickname: d.Author.Nickname,
			Avatar:   d.Author.Avatar,
		},
		Music: MusicInfo{
			ID:       d.MusicInfo.ID,
			Title:    d.MusicInfo.Title,
			Author:   d.MusicInfo.Author,
			URL:      d.Music,
			Cover:    d.MusicInfo.Cover,
			Duration: d.MusicInfo.Duration,
		},
		Stats: map[string]int64{
			"likes":     d.DiggCount,
			"comments":  d.CommentCount,
			"shares":    d.ShareCount,
			"views":     d.PlayCount,
			"downloads": d.DownloadCount,
		},
	}

	// Deteksi apakah post adalah Photo Slide (Carousel) atau Video
	if len(d.Images) > 0 {
		result.PostType = "carousel"
		for i, imgURL := range d.Images {
			result.Media = append(result.Media, MediaItem{
				Type:    "image",
				Quality: fmt.Sprintf("Slide #%d", i+1),
				URL:     imgURL,
			})
		}
	} else {
		result.PostType = "video"
		// 1. Video No Watermark (SD / Default)
		if d.Play != "" {
			result.Media = append(result.Media, MediaItem{
				Type:    "video",
				Quality: "No Watermark (SD)",
				URL:     d.Play,
				Size:    formatBytes(d.Size),
			})
		}
		// 2. Video No Watermark (HD 1080p) jika tersedia
		if d.HdPlay != "" && d.HdPlay != d.Play {
			result.Media = append(result.Media, MediaItem{
				Type:    "video",
				Quality: "No Watermark (HD)",
				URL:     d.HdPlay,
				Size:    formatBytes(d.HdSize),
			})
		}
		// 3. Video With Watermark
		if d.WmPlay != "" {
			result.Media = append(result.Media, MediaItem{
				Type:    "video",
				Quality: "With Watermark",
				URL:     d.WmPlay,
				Size:    formatBytes(d.WmSize),
			})
		}
	}

	return result, nil
}
