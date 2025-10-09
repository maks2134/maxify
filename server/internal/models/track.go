package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Track struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Title     string         `json:"title" gorm:"not null"`
	Artist    string         `json:"artist"`
	Duration  int            `json:"duration" gorm:"not null"` // Duration in seconds
	FilePath  string         `json:"file_path" gorm:"not null"`
	FileSize  int64          `json:"file_size" gorm:"not null"`
	MimeType  string         `json:"mime_type" gorm:"not null"`
	UserID    uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	User      User       `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Playlists []Playlist `json:"playlists,omitempty" gorm:"many2many:playlist_tracks;"`
}

func (t *Track) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
