package spotify

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"free-api/lib/ytdl"
)

// SpotifyTrack menyimpan informasi metadata lagu dan URL unduhan audio
type SpotifyTrack struct {
	ID             string `json:"id"`
	Title          string `json:"title"`
	Artist         string `json:"artist"`
	Album          string `json:"album"`
	Cover          string `json:"cover"`
	PreviewAudio   string `json:"preview_audio,omitempty"`
	DownloadURL    string `json:"download_url"`
	DownloadStream string `json:"download_stream"`
	ApproxSize     string `json:"approx_size,omitempty"`
	MatchedYouTube string `json:"matched_youtube,omitempty"`
}

var httpClient = &http.Client{Timeout: 15 * time.Second}

// ExtractTrackID mengekstrak ID lagu dari link Spotify
func ExtractTrackID(input string) string {
	re := regexp.MustCompile(`track/([a-zA-Z0-9]+)`)
	matches := re.FindStringSubmatch(input)
	if len(matches) > 1 {
		return matches[1]
	}
	// Jika user memasukkan ID secara langsung (panjang 22 karakter base62)
	reDirectID := regexp.MustCompile(`^[a-zA-Z0-9]{22}$`)
	if reDirectID.MatchString(strings.TrimSpace(input)) {
		return strings.TrimSpace(input)
	}
	return ""
}

// searchYouTubeVideoID mencari video ID YouTube untuk audio yang sesuai
func searchYouTubeVideoID(query string) (string, error) {
	searchURL := fmt.Sprintf("https://www.youtube.com/results?search_query=%s", url.QueryEscape(query))
	req, err := http.NewRequest("GET", searchURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	content := string(b)

	re := regexp.MustCompile(`"videoId":"([a-zA-Z0-9_-]{11})"`)
	matches := re.FindAllStringSubmatch(content, -1)
	for _, m := range matches {
		if len(m) > 1 && m[1] != "" {
			return m[1], nil
		}
	}

	return "", fmt.Errorf("tidak ditemukan audio yang cocok di YouTube")
}

// ExtractSpotify mengambil metadata lagu dari Spotify dan mencocokkan audio stream kualitas tinggi
func ExtractSpotify(input string) (*SpotifyTrack, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return nil, fmt.Errorf("URL atau judul lagu tidak boleh kosong")
	}

	trackID := ExtractTrackID(input)
	title := input
	artist := ""
	album := ""
	cover := ""
	previewAudio := ""

	// Jika input berupa link Spotify atau Track ID, ambil metadata resmi dari Spotify
	if trackID != "" {
		embedURL := fmt.Sprintf("https://open.spotify.com/embed/track/%s", trackID)
		req, err := http.NewRequest("GET", embedURL, nil)
		if err == nil {
			req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
			if resp, err := httpClient.Do(req); err == nil {
				defer resp.Body.Close()
				if b, err := io.ReadAll(resp.Body); err == nil {
					html := string(b)
					reData := regexp.MustCompile(`<script id="__NEXT_DATA__" type="application/json">([^<]+)</script>`)
					mData := reData.FindStringSubmatch(html)
					if len(mData) > 1 {
						var nextData map[string]any
						if json.Unmarshal([]byte(mData[1]), &nextData) == nil {
							if props, ok := nextData["props"].(map[string]any); ok {
								if pageProps, ok := props["pageProps"].(map[string]any); ok {
									if state, ok := pageProps["state"].(map[string]any); ok {
										if data, ok := state["data"].(map[string]any); ok {
											if entity, ok := data["entity"].(map[string]any); ok {
												if name, ok := entity["name"].(string); ok {
													title = name
												}
												if artists, ok := entity["artists"].([]any); ok && len(artists) > 0 {
													var artistNames []string
													for _, a := range artists {
														if aMap, ok := a.(map[string]any); ok {
															if aname, ok := aMap["name"].(string); ok {
																artistNames = append(artistNames, aname)
															}
														}
													}
													artist = strings.Join(artistNames, ", ")
												}
												if albumMap, ok := entity["album"].(map[string]any); ok {
													if aname, ok := albumMap["name"].(string); ok {
														album = aname
													}
												}
												if visual, ok := entity["visualIdentity"].(map[string]any); ok {
													if images, ok := visual["image"].([]any); ok && len(images) > 0 {
														if imgMap, ok := images[0].(map[string]any); ok {
															if imgURL, ok := imgMap["url"].(string); ok {
																cover = imgURL
															}
														}
													}
												}
												if audioPreview, ok := entity["audioPreview"].(map[string]any); ok {
													if pURL, ok := audioPreview["url"].(string); ok {
														previewAudio = pURL
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	// Buat query pencarian audio ke YouTube: "{Artist} {Title} audio"
	searchQuery := fmt.Sprintf("%s %s audio", artist, title)
	searchQuery = strings.TrimSpace(searchQuery)

	ytVideoID, err := searchYouTubeVideoID(searchQuery)
	if err != nil {
		return nil, fmt.Errorf("gagal menemukan audio untuk lagu '%s': %w", title, err)
	}

	ytURL := fmt.Sprintf("https://www.youtube.com/watch?v=%s", ytVideoID)
	ytInfo, err := ytdl.ExtractVideoInfo(ytURL)
	if err != nil {
		return nil, fmt.Errorf("gagal mengekstrak audio: %w", err)
	}

	// Cari format audio terbaik
	var bestAudio *ytdl.FormatInfo
	for i := range ytInfo.Formats {
		f := &ytInfo.Formats[i]
		if f.FormatType == "audio_only" {
			bestAudio = f
			break
		}
	}

	if bestAudio == nil && len(ytInfo.Formats) > 0 {
		bestAudio = &ytInfo.Formats[0]
	}

	if bestAudio == nil {
		return nil, fmt.Errorf("tidak ada format audio yang dapat diunduh")
	}

	if cover == "" {
		cover = ytInfo.Thumbnail
	}

	downloadStream := fmt.Sprintf("/api/ytdl/download?url=%s&itag=%d", url.QueryEscape(ytURL), bestAudio.Itag)

	return &SpotifyTrack{
		ID:             trackID,
		Title:          title,
		Artist:         artist,
		Album:          album,
		Cover:          cover,
		PreviewAudio:   previewAudio,
		DownloadURL:    bestAudio.DirectURL,
		DownloadStream: downloadStream,
		ApproxSize:     bestAudio.ApproxSize,
		MatchedYouTube: ytURL,
	}, nil
}
