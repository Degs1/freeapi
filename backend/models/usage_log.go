package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UsageLog mencatat setiap pemanggilan endpoint tool untuk keperluan analitik & pemantauan
type UsageLog struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Tool       string             `bson:"tool" json:"tool"`             // "brat", "youtube", "tiktok", "instagram", "spotify"
	Endpoint   string             `bson:"endpoint" json:"endpoint"`     // "/api/maker/brat", "/api/download/tiktok"
	IP         string             `bson:"ip" json:"ip"`
	UserAgent  string             `bson:"user_agent" json:"user_agent"`
	StatusCode int                `bson:"status_code" json:"status_code"`
	DurationMS int64              `bson:"duration_ms" json:"duration_ms"`
	Timestamp  time.Time          `bson:"timestamp" json:"timestamp"`
}
