package brat

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"os"
	"path/filepath"
	"strings"
	"unicode"

	"github.com/disintegration/imaging"
	"github.com/rivo/uniseg"
	"golang.org/x/image/font"
	"golang.org/x/image/font/opentype"
	"golang.org/x/image/math/fixed"
)

type Config struct {
	Width, Height int
	Padding       int
	MaxFontSize   int
	MinFontSize   int
	Blur          float64
	Align         string
	Background    color.Color
	EmojiDir      string
}

type Token struct {
	Text    string
	Emoji   image.Image
	Width   int
	IsSpace bool
}

type Line struct {
	Tokens []Token
	Width  int
}

type Renderer struct {
	Font   *opentype.Font
	Config Config
	Emojis map[string]image.Image
}

func (r *Renderer) emojiImage(s string) image.Image {
	if img, ok := r.Emojis[s]; ok {
		return img
	}

	var codes []string
	for _, ch := range s {
		// Twemoji filenames omit VS16
		if ch != '\ufe0f' {
			codes = append(codes, fmt.Sprintf("%x", ch))
		}
	}

	name := strings.Join(codes, "-") + ".png"
	path := filepath.Join(r.Config.EmojiDir, name)

	img, err := imaging.Open(path)
	if err != nil {
		r.Emojis[s] = nil
		return nil
	}

	r.Emojis[s] = img
	return img
}

func isEmoji(s string) bool {
	for _, ch := range s {
		if ch >= 0x1F000 ||
			ch == 0x200D ||
			ch == 0xFE0F ||
			ch == 0x20E3 {
			return true
		}
	}
	return false
}

func (r *Renderer) tokenize(
	text string,
	face font.Face,
	size int,
) []Token {
	var tokens []Token

	graphemes := uniseg.NewGraphemes(text)

	for graphemes.Next() {
		s := graphemes.Str()

		if s == "\n" {
			tokens = append(tokens, Token{Text: "\n"})
			continue
		}

		if isEmoji(s) {
			if img := r.emojiImage(s); img != nil {
				tokens = append(tokens, Token{
					Text:  s,
					Emoji: img,
					Width: size,
				})
				continue
			}
		}

		tokens = append(tokens, Token{
			Text:    s,
			Width:   font.MeasureString(face, s).Ceil(),
			IsSpace: unicode.IsSpace([]rune(s)[0]),
		})
	}

	return tokens
}

func layout(tokens []Token, maxWidth int) []Line {
	var lines []Line
	current := Line{}
	lastSpace := -1

	recalculate := func() {
		current.Width = 0
		lastSpace = -1
		for i, t := range current.Tokens {
			current.Width += t.Width
			if t.IsSpace {
				lastSpace = i
			}
		}
	}

	for _, token := range tokens {
		if token.Text == "\n" {
			lines = append(lines, current)
			current = Line{}
			lastSpace = -1
			continue
		}

		current.Tokens = append(current.Tokens, token)
		recalculate()

		for current.Width > maxWidth && len(current.Tokens) > 1 {
			if lastSpace >= 0 {
				left := append([]Token(nil), current.Tokens[:lastSpace]...)
				right := append([]Token(nil), current.Tokens[lastSpace+1:]...)

				for len(left) > 0 && left[len(left)-1].IsSpace {
					left = left[:len(left)-1]
				}
				for len(right) > 0 && right[0].IsSpace {
					right = right[1:]
				}

				line := Line{Tokens: left}
				for _, t := range left {
					line.Width += t.Width
				}
				lines = append(lines, line)
				current.Tokens = right
			} else {
				last := current.Tokens[len(current.Tokens)-1]
				current.Tokens = current.Tokens[:len(current.Tokens)-1]
				recalculate()
				lines = append(lines, current)
				current = Line{Tokens: []Token{last}}
			}
			recalculate()
		}
	}

	lines = append(lines, current)
	return lines
}

func (r *Renderer) autoFit(
	text string,
) (font.Face, []Line, int, int, error) {
	cfg := r.Config
	maxWidth := cfg.Width - cfg.Padding*2
	maxHeight := cfg.Height - cfg.Padding*2

	if maxWidth <= 0 || maxHeight <= 0 {
		return nil, nil, 0, 0, fmt.Errorf("padding terlalu besar")
	}

	for size := cfg.MaxFontSize; size >= cfg.MinFontSize; size-- {
		face, err := opentype.NewFace(r.Font, &opentype.FaceOptions{
			Size: float64(size),
			DPI:  72,
		})
		if err != nil {
			return nil, nil, 0, 0, err
		}

		tokens := r.tokenize(text, face, size)
		lines := layout(tokens, maxWidth)

		lineHeight := face.Metrics().Height.Ceil()
		if lineHeight < size {
			lineHeight = size
		}

		fits := len(lines)*lineHeight <= maxHeight
		for _, line := range lines {
			if line.Width > maxWidth {
				fits = false
			}
		}

		if fits {
			return face, lines, size, lineHeight, nil
		}

		face.Close()
	}

	return nil, nil, 0, 0, fmt.Errorf("teks terlalu panjang untuk canvas")
}

func (r *Renderer) Generate(text string) (*image.RGBA, error) {
	cfg := r.Config

	img := image.NewRGBA(image.Rect(0, 0, cfg.Width, cfg.Height))
	draw.Draw(img, img.Bounds(),
		&image.Uniform{C: cfg.Background},
		image.Point{}, draw.Src,
	)

	face, lines, size, lineHeight, err := r.autoFit(text)
	if err != nil {
		return nil, err
	}
	defer face.Close()

	// Layer transparan agar blur tidak mengenai background
	layer := image.NewRGBA(img.Bounds())

	drawer := font.Drawer{
		Dst:  layer,
		Src:  image.NewUniform(color.Black),
		Face: face,
	}

	totalHeight := len(lines) * lineHeight
	top := (cfg.Height - totalHeight) / 2
	ascent := face.Metrics().Ascent.Ceil()

	for i, line := range lines {
		var x int

		switch cfg.Align {
		case "right":
			x = cfg.Width - cfg.Padding - line.Width
		case "center":
			x = (cfg.Width - line.Width) / 2
		default:
			x = cfg.Padding
		}

		y := top + i*lineHeight + ascent

		for _, token := range line.Tokens {
			if token.Emoji != nil {
				emoji := imaging.Resize(
					token.Emoji,
					size, size,
					imaging.Lanczos,
				)

				// Align emoji ke area teks
				pos := image.Pt(x, y-ascent)
				rect := image.Rectangle{
					Min: pos,
					Max: pos.Add(emoji.Bounds().Size()),
				}

				draw.Draw(layer, rect, emoji,
					emoji.Bounds().Min, draw.Over)
			} else {
				drawer.Dot = fixed.P(x, y)
				drawer.DrawString(token.Text)
			}

			x += token.Width
		}
	}

	if cfg.Blur > 0 {
		blurred := imaging.Blur(layer, cfg.Blur)
		draw.Draw(img, img.Bounds(),
			blurred, blurred.Bounds().Min, draw.Over)
	} else {
		draw.Draw(img, img.Bounds(),
			layer, layer.Bounds().Min, draw.Over)
	}

	return img, nil
}

// GenerateBratImage menghasilkan image.Image langsung di memori tanpa menulis ke disk (aman untuk concurrent/banyak user)
func GenerateBratImage(text string) (image.Image, error) {
	fontData, err := os.ReadFile("arial.ttf")
	if err != nil {
		return nil, fmt.Errorf("font arial.ttf tidak ditemukan: %w", err)
	}

	parsed, err := opentype.Parse(fontData)
	if err != nil {
		return nil, fmt.Errorf("gagal parse font: %w", err)
	}

	renderer := Renderer{
		Font: parsed,
		Config: Config{
			Width:       512,
			Height:      512,
			Padding:     40,
			MaxFontSize: 100,
			MinFontSize: 10,
			Blur:        1.5,
			Align:       "left",
			Background:  color.RGBA{255, 255, 255, 255},
			EmojiDir:    "emoji",
		},
		Emojis: make(map[string]image.Image),
	}

	return renderer.Generate(text)
}

// GenerateBratSticker membuat sticker dan langsung mengembalikan byte PNG di memori (tanpa write ke local file)
func GenerateBratSticker(text string) ([]byte, error) {
	img, err := GenerateBratImage(text)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return nil, fmt.Errorf("gagal encode png: %w", err)
	}

	return buf.Bytes(), nil
}

