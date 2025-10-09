package services

import (
	"fmt"
	"strings"

	"maxify/internal/database"
	"maxify/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SearchService struct {
	db *gorm.DB
}

func NewSearchService() *SearchService {
	return &SearchService{
		db: database.GetDB(),
	}
}

type SearchRequest struct {
	Query  string `json:"query" binding:"required,min=1"`
	UserID uuid.UUID
	Limit  int
	Offset int
}

type SearchResponse struct {
	Tracks    []*TrackResponse    `json:"tracks"`
	Playlists []*PlaylistResponse `json:"playlists"`
	Total     int                 `json:"total"`
}

func (s *SearchService) Search(req *SearchRequest) (*SearchResponse, error) {
	query := strings.TrimSpace(req.Query)
	if query == "" {
		return &SearchResponse{
			Tracks:    []*TrackResponse{},
			Playlists: []*PlaylistResponse{},
			Total:     0,
		}, nil
	}

	tracks, err := s.searchTracks(query, req.UserID, req.Limit, req.Offset)
	if err != nil {
		return nil, fmt.Errorf("failed to search tracks: %w", err)
	}

	playlists, err := s.searchPlaylists(query, req.UserID, req.Limit, req.Offset)
	if err != nil {
		return nil, fmt.Errorf("failed to search playlists: %w", err)
	}

	total := len(tracks) + len(playlists)

	return &SearchResponse{
		Tracks:    tracks,
		Playlists: playlists,
		Total:     total,
	}, nil
}

func (s *SearchService) searchTracks(query string, userID uuid.UUID, limit, offset int) ([]*TrackResponse, error) {
	var tracks []models.Track

	searchQuery := fmt.Sprintf("%%%s%%", query)

	if err := s.db.Where("user_id = ? AND (title ILIKE ? OR artist ILIKE ?)",
		userID, searchQuery, searchQuery).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tracks).Error; err != nil {
		return nil, err
	}

	var responses []*TrackResponse
	for _, track := range tracks {
		responses = append(responses, &TrackResponse{
			ID:        track.ID,
			Title:     track.Title,
			Artist:    track.Artist,
			Duration:  track.Duration,
			FileSize:  track.FileSize,
			MimeType:  track.MimeType,
			CreatedAt: track.CreatedAt,
		})
	}

	return responses, nil
}

func (s *SearchService) searchPlaylists(query string, userID uuid.UUID, limit, offset int) ([]*PlaylistResponse, error) {
	var playlists []models.Playlist

	searchQuery := fmt.Sprintf("%%%s%%", query)

	if err := s.db.Where("user_id = ? AND (name ILIKE ? OR description ILIKE ?)",
		userID, searchQuery, searchQuery).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&playlists).Error; err != nil {
		return nil, err
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

func (s *SearchService) SearchTracksOnly(query string, userID uuid.UUID, limit, offset int) ([]*TrackResponse, error) {
	return s.searchTracks(query, userID, limit, offset)
}

func (s *SearchService) SearchPlaylistsOnly(query string, userID uuid.UUID, limit, offset int) ([]*PlaylistResponse, error) {
	return s.searchPlaylists(query, userID, limit, offset)
}

func (s *SearchService) GetSearchSuggestions(query string, userID uuid.UUID, limit int) ([]string, error) {
	if len(query) < 2 {
		return []string{}, nil
	}

	var suggestions []string
	searchQuery := fmt.Sprintf("%%%s%%", query)

	var trackTitles []string
	s.db.Model(&models.Track{}).
		Where("user_id = ? AND title ILIKE ?", userID, searchQuery).
		Select("DISTINCT title").
		Limit(limit/2).
		Pluck("title", &trackTitles)
	suggestions = append(suggestions, trackTitles...)

	var artists []string
	s.db.Model(&models.Track{}).
		Where("user_id = ? AND artist ILIKE ?", userID, searchQuery).
		Select("DISTINCT artist").
		Limit(limit/2).
		Pluck("artist", &artists)
	suggestions = append(suggestions, artists...)

	var playlistNames []string
	s.db.Model(&models.Playlist{}).
		Where("user_id = ? AND name ILIKE ?", userID, searchQuery).
		Select("DISTINCT name").
		Limit(limit/2).
		Pluck("name", &playlistNames)
	suggestions = append(suggestions, playlistNames...)

	uniqueSuggestions := make(map[string]bool)
	var result []string
	for _, suggestion := range suggestions {
		if !uniqueSuggestions[suggestion] && len(result) < limit {
			uniqueSuggestions[suggestion] = true
			result = append(result, suggestion)
		}
	}

	return result, nil
}
