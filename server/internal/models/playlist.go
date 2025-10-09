package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Playlist struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	User   User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Tracks []Track `json:"tracks,omitempty" gorm:"many2many:playlist_tracks;"`
}

type PlaylistTrack struct {
	PlaylistID uuid.UUID `json:"playlist_id" gorm:"type:uuid;primary_key"`
	TrackID    uuid.UUID `json:"track_id" gorm:"type:uuid;primary_key"`
	Order      int       `json:"order" gorm:"not null;default:0"`
	AddedAt    time.Time `json:"added_at" gorm:"default:CURRENT_TIMESTAMP"`

	Playlist Playlist `json:"playlist,omitempty" gorm:"foreignKey:PlaylistID"`
	Track    Track    `json:"track,omitempty" gorm:"foreignKey:TrackID"`
}

func (p *Playlist) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
