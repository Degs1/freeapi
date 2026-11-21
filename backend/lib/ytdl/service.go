package ytdl

import (
	"fmt"
	"io"
	"regexp"
	"strings"
	"time"

	"github.com/kkdai/youtube/v2"
)

// FormatInfo merepresentasikan informasi satu format resolusi/audio
type FormatInfo struct {
	Itag        int    `json:"itag"`
	Quality     string `json:"quality"`
	Resolution  string `json:"resolution"`
	MimeType    string `json:"mime_type"`
	Container   string `json:"container"`
	FormatType  string `json:"format_type"` // "video_audio", "video_only", "audio_only"
	HasVideo    bool   `json:"has_video"`
	HasAudio    bool   `json:"has_audio"`
	ApproxSize  string `json:"approx_size"`
	DirectURL   string `json:"direct_url"`
}

// VideoInfo merepresentasikan metadata video YouTube beserta format yang tersedia
type VideoInfo struct {
	ID              string       `json:"id"`
	Title           string       `json:"title"`
	Author          string       `json:"author"`
	Duration        string       `json:"duration"`
	DurationSeconds int          `json:"duration_seconds"`
	Thumbnail       string       `json:"thumbnail"`
	Formats         []FormatInfo `json:"formats"`
}

var client = youtube.Client{}

// formatBytes mengubah ukuran bytes ke format human-readable (KB, MB, GB)
func formatBytes(bytes int64) string {
	if bytes <= 0 {
		return "N/A"
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

// SanitizeFilename membersihkan karakter ilegal pada nama file
func SanitizeFilename(name string) string {
	re := regexp.MustCompile(`[\\/:*?"<>|]`)
	cleaned := re.ReplaceAllString(name, "")
	cleaned = strings.TrimSpace(cleaned)
	if cleaned == "" {
		cleaned = "youtube_download"
	}
	return cleaned
}

// ExtractVideoInfo mengambil metadata dan tautan direct stream dari video YouTube
func ExtractVideoInfo(videoURL string) (*VideoInfo, error) {
	video, err := client.GetVideo(videoURL)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil info video: %w", err)
	}

	// Pilih thumbnail dengan resolusi terbaik
	thumbnail := ""
	if len(video.Thumbnails) > 0 {
		thumbnail = video.Thumbnails[len(video.Thumbnails)-1].URL
	}
	if thumbnail == "" && video.ID != "" {
		thumbnail = fmt.Sprintf("https://i.ytimg.com/vi/%s/maxresdefault.jpg", video.ID)
	}

	var formats []FormatInfo
	seenItags := make(map[int]bool)

	for i := range video.Formats {
		f := &video.Formats[i]
		if seenItags[f.ItagNo] {
			continue
		}

		hasVideo := strings.Contains(f.MimeType, "video")
		hasAudio := f.AudioChannels > 0 || strings.Contains(f.MimeType, "audio")

		formatType := "other"
		if hasVideo && hasAudio {
			formatType = "video_audio"
		} else if hasVideo && !hasAudio {
			formatType = "video_only"
		} else if !hasVideo && hasAudio {
			formatType = "audio_only"
		}

		// Ambil resolusi / quality label yang jelas
		quality := f.QualityLabel
		if quality == "" {
			quality = f.Quality
		}

		resolution := ""
		if f.Width > 0 && f.Height > 0 {
			resolution = fmt.Sprintf("%dx%d", f.Width, f.Height)
		} else if formatType == "audio_only" {
			resolution = "Audio Only"
		}

		container := "mp4"
		if strings.Contains(f.MimeType, "webm") {
			container = "webm"
		} else if strings.Contains(f.MimeType, "mp4") {
			container = "mp4"
		}

		// Dapatkan direct streaming URL dari Google Video CDN
		directURL, err := client.GetStreamURL(video, f)
		if err != nil {
			// Jika gagal decrypt cipher untuk itag ini, lewati
			continue
		}

		seenItags[f.ItagNo] = true

		// Hitung perkiraan ukuran file
		approxSize := "N/A"
		if f.ContentLength > 0 {
			approxSize = formatBytes(f.ContentLength)
		} else if f.Bitrate > 0 && video.Duration > 0 {
			estimatedBytes := int64(f.Bitrate/8) * int64(video.Duration.Seconds())
			approxSize = formatBytes(estimatedBytes)
		}

		formats = append(formats, FormatInfo{
			Itag:        f.ItagNo,
			Quality:     quality,
			Resolution:  resolution,
			MimeType:    f.MimeType,
			Container:   container,
			FormatType:  formatType,
			HasVideo:    hasVideo,
			HasAudio:    hasAudio,
			ApproxSize:  approxSize,
			DirectURL:   directURL,
		})
	}

	durationSec := int(video.Duration.Seconds())
	durationStr := formatDuration(video.Duration)

	return &VideoInfo{
		ID:              video.ID,
		Title:           video.Title,
		Author:          video.Author,
		Duration:        durationStr,
		DurationSeconds: durationSec,
		Thumbnail:       thumbnail,
		Formats:         formats,
	}, nil
}

// formatDuration memformat durasi ke bentuk MM:SS atau HH:MM:SS
func formatDuration(d time.Duration) string {
	d = d.Round(time.Second)
	h := d / time.Hour
	d -= h * time.Hour
	m := d / time.Minute
	d -= m * time.Minute
	s := d / time.Second
	if h > 0 {
		return fmt.Sprintf("%02d:%02d:%02d", h, m, s)
	}
	return fmt.Sprintf("%02d:%02d", m, s)
}

// GetStreamReader mengembalikan stream reader langsung dari YouTube
func GetStreamReader(videoURL string, itag int) (io.ReadCloser, int64, string, string, error) {
	video, err := client.GetVideo(videoURL)
	if err != nil {
		return nil, 0, "", "", fmt.Errorf("gagal mendapatkan video: %w", err)
	}

	var targetFormat *youtube.Format
	for i := range video.Formats {
		if video.Formats[i].ItagNo == itag {
			targetFormat = &video.Formats[i]
			break
		}
	}

	if targetFormat == nil {
		// Default jika itag tidak ditemukan: gunakan format terbaik dengan audio
		formats := video.Formats.WithAudioChannels()
		if len(formats) > 0 {
			targetFormat = &formats[0]
		} else if len(video.Formats) > 0 {
			targetFormat = &video.Formats[0]
		} else {
			return nil, 0, "", "", fmt.Errorf("tidak ada format stream yang tersedia")
		}
	}

	stream, size, err := client.GetStream(video, targetFormat)
	if err != nil {
		return nil, 0, "", "", fmt.Errorf("gagal membuka stream: %w", err)
	}

	ext := "mp4"
	if strings.Contains(targetFormat.MimeType, "webm") {
		ext = "webm"
	}
	if !strings.Contains(targetFormat.MimeType, "video") && strings.Contains(targetFormat.MimeType, "audio") {
		if ext == "mp4" {
			ext = "m4a"
		}
	}

	filename := fmt.Sprintf("%s.%s", SanitizeFilename(video.Title), ext)
	return stream, size, targetFormat.MimeType, filename, nil
}
