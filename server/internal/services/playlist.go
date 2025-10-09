package services

import (
	"errors"
	"fmt"

	"maxify/internal/database"
	"maxify/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PlaylistService struct {
	db *gorm.DB
}

func NewPlaylistService() *PlaylistService {
	return &PlaylistService{
		db: database.GetDB(),
	}
}

type CreatePlaylistRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=100"`
	Description string `json:"description" binding:"max=500"`
	UserID      uuid.UUID
}

type PlaylistResponse struct {
	ID          uuid.UUID        `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	UserID      uuid.UUID        `json:"user_id"`
	Tracks      []*TrackResponse `json:"tracks,omitempty"`
	CreatedAt   string           `json:"created_at"`
	UpdatedAt   string           `json:"updated_at"`
}

func (s *PlaylistService) CreatePlaylist(req *CreatePlaylistRequest) (*PlaylistResponse, error) {
	playlist := &models.Playlist{
		Name:        req.Name,
		Description: req.Description,
		UserID:      req.UserID,
	}

	if err := s.db.Create(playlist).Error; err != nil {
		return nil, fmt.Errorf("failed to create playlist: %w", err)
	}

	return &PlaylistResponse{
		ID:          playlist.ID,
		Name:        playlist.Name,
		Description: playlist.Description,
		UserID:      playlist.UserID,
		CreatedAt:   playlist.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   playlist.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

func (s *PlaylistService) GetUserPlaylists(userID uuid.UUID, limit, offset int) ([]*PlaylistResponse, error) {
	var playlists []models.Playlist
	if err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&playlists).Error; err != nil {
		return nil, fmt.Errorf("failed to get user playlists: %w", err)
	}

	var responses []*PlaylistResponse
	for _, playlist := range playlists {
		responses = append(responses, &PlaylistResponse{
			ID:          playlist.ID,
			Name:        playlist.Name,
			Description: playlist.Description,
			UserID:      playlist.UserID,
			CreatedAt:   playlist.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:   playlist.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	return responses, nil
}

func (s *PlaylistService) GetPlaylistByID(playlistID, userID uuid.UUID) (*PlaylistResponse, error) {
	var playlist models.Playlist
	if err := s.db.Where("id = ? AND user_id = ?", playlistID, userID).
		Preload("Tracks").
		First(&playlist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("playlist not found")
		}
		return nil, fmt.Errorf("failed to get playlist: %w", err)
	}

	var tracks []*TrackResponse
	for _, track := range playlist.Tracks {
		tracks = append(tracks, &TrackResponse{
			ID:        track.ID,
			Title:     track.Title,
			Artist:    track.Artist,
			Duration:  track.Duration,
			FileSize:  track.FileSize,
			MimeType:  track.MimeType,
			CreatedAt: track.CreatedAt,
		})
	}

	return &PlaylistResponse{
		ID:          playlist.ID,
		Name:        playlist.Name,
		Description: playlist.Description,
		UserID:      playlist.UserID,
		Tracks:      tracks,
		CreatedAt:   playlist.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   playlist.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

func (s *PlaylistService) UpdatePlaylist(playlistID, userID uuid.UUID, updates map[string]interface{}) (*PlaylistResponse, error) {
	var playlist models.Playlist
	if err := s.db.Where("id = ? AND user_id = ?", playlistID, userID).First(&playlist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("playlist not found")
		}
		return nil, fmt.Errorf("failed to get playlist: %w", err)
	}

	if err := s.db.Model(&playlist).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update playlist: %w", err)
	}

	return &PlaylistResponse{
		ID:          playlist.ID,
		Name:        playlist.Name,
		Description: playlist.Description,
		UserID:      playlist.UserID,
		CreatedAt:   playlist.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   playlist.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

func (s *PlaylistService) DeletePlaylist(playlistID, userID uuid.UUID) error {
	var playlist models.Playlist
	if err := s.db.Where("id = ? AND user_id = ?", playlistID, userID).First(&playlist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("playlist not found")
		}
		return fmt.Errorf("failed to get playlist: %w", err)
	}

	if err := s.db.Delete(&playlist).Error; err != nil {
		return fmt.Errorf("failed to delete playlist: %w", err)
	}

	return nil
}

func (s *PlaylistService) AddTrackToPlaylist(playlistID, trackID, userID uuid.UUID) error {
	var playlist models.Playlist
	if err := s.db.Where("id = ? AND user_id = ?", playlistID, userID).First(&playlist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("playlist not found")
		}
		return fmt.Errorf("failed to get playlist: %w", err)
	}

	var track models.Track
	if err := s.db.Where("id = ? AND user_id = ?", trackID, userID).First(&track).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("track not found")
		}
		return fmt.Errorf("failed to get track: %w", err)
	}

	var existingPlaylistTrack models.PlaylistTrack
	if err := s.db.Where("playlist_id = ? AND track_id = ?", playlistID, trackID).First(&existingPlaylistTrack).Error; err == nil {
		return errors.New("track already in playlist")
	}

	var maxOrder int
	s.db.Model(&models.PlaylistTrack{}).Where("playlist_id = ?", playlistID).Select("COALESCE(MAX(\"order\"), 0)").Scan(&maxOrder)

	playlistTrack := &models.PlaylistTrack{
		PlaylistID: playlistID,
		TrackID:    trackID,
		Order:      maxOrder + 1,
	}

	if err := s.db.Create(playlistTrack).Error; err != nil {
		return fmt.Errorf("failed to add track to playlist: %w", err)
	}

	return nil
}

func (s *PlaylistService) RemoveTrackFromPlaylist(playlistID, trackID, userID uuid.UUID) error {
	var playlist models.Playlist
	if err := s.db.Where("id = ? AND user_id = ?", playlistID, userID).First(&playlist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("playlist not found")
		}
		return fmt.Errorf("failed to get playlist: %w", err)
	}

	if err := s.db.Where("playlist_id = ? AND track_id = ?", playlistID, trackID).Delete(&models.PlaylistTrack{}).Error; err != nil {
		return fmt.Errorf("failed to remove track from playlist: %w", err)
	}

	return nil
}

func (s *PlaylistService) ReorderPlaylistTracks(playlistID, userID uuid.UUID, trackOrders []struct {
	TrackID uuid.UUID `json:"track_id"`
	Order   int       `json:"order"`
}) error {
	var playlist models.Playlist
	if err := s.db.Where("id = ? AND user_id = ?", playlistID, userID).First(&playlist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("playlist not found")
		}
		return fmt.Errorf("failed to get playlist: %w", err)
	}

	for _, trackOrder := range trackOrders {
		if err := s.db.Model(&models.PlaylistTrack{}).
			Where("playlist_id = ? AND track_id = ?", playlistID, trackOrder.TrackID).
			Update("order", trackOrder.Order).Error; err != nil {
			return fmt.Errorf("failed to update track order: %w", err)
		}
	}

	return nil
}
