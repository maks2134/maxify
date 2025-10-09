package services

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"maxify/internal/config"
	"maxify/internal/database"
	"maxify/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TrackService struct {
	config *config.Config
	db     *gorm.DB
}

func NewTrackService(cfg *config.Config) *TrackService {
	return &TrackService{
		config: cfg,
		db:     database.GetDB(),
	}
}

type UploadTrackRequest struct {
	File   *multipart.FileHeader
	UserID uuid.UUID
}

type TrackResponse struct {
	ID        uuid.UUID `json:"id"`
	Title     string    `json:"title"`
	Artist    string    `json:"artist"`
	Duration  int       `json:"duration"`
	FileSize  int64     `json:"file_size"`
	MimeType  string    `json:"mime_type"`
	CreatedAt time.Time `json:"created_at"`
}

func (s *TrackService) UploadTrack(req *UploadTrackRequest) (*TrackResponse, error) {
	if err := s.validateFile(req.File); err != nil {
		return nil, err
	}

	if err := os.MkdirAll(s.config.Storage.UploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	fileExt := filepath.Ext(req.File.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), fileExt)
	filePath := filepath.Join(s.config.Storage.UploadDir, filename)

	if err := s.saveFile(req.File, filePath); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	title, artist := s.extractMetadata(req.File.Filename)

	track := &models.Track{
		Title:    title,
		Artist:   artist,
		Duration: 0, // Would be extracted from audio file in real implementation
		FilePath: filePath,
		FileSize: req.File.Size,
		MimeType: req.File.Header.Get("Content-Type"),
		UserID:   req.UserID,
	}

	if err := s.db.Create(track).Error; err != nil {
		os.Remove(filePath)
		return nil, fmt.Errorf("failed to create track record: %w", err)
	}

	return &TrackResponse{
		ID:        track.ID,
		Title:     track.Title,
		Artist:    track.Artist,
		Duration:  track.Duration,
		FileSize:  track.FileSize,
		MimeType:  track.MimeType,
		CreatedAt: track.CreatedAt,
	}, nil
}

func (s *TrackService) GetUserTracks(userID uuid.UUID, limit, offset int) ([]*TrackResponse, error) {
	var tracks []models.Track
	if err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tracks).Error; err != nil {
		return nil, fmt.Errorf("failed to get user tracks: %w", err)
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

func (s *TrackService) GetTrackByID(trackID uuid.UUID) (*models.Track, error) {
	var track models.Track
	if err := s.db.First(&track, trackID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("track not found")
		}
		return nil, fmt.Errorf("failed to get track: %w", err)
	}
	return &track, nil
}

func (s *TrackService) DeleteTrack(trackID, userID uuid.UUID) error {
	var track models.Track
	if err := s.db.Where("id = ? AND user_id = ?", trackID, userID).First(&track).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("track not found")
		}
		return fmt.Errorf("failed to get track: %w", err)
	}

	if err := s.db.Delete(&track).Error; err != nil {
		return fmt.Errorf("failed to delete track: %w", err)
	}

	if err := os.Remove(track.FilePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}

func (s *TrackService) GetTrackFile(trackID, userID uuid.UUID) (string, error) {
	var track models.Track
	if err := s.db.Where("id = ? AND user_id = ?", trackID, userID).First(&track).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("track not found")
		}
		return "", fmt.Errorf("failed to get track: %w", err)
	}

	if _, err := os.Stat(track.FilePath); os.IsNotExist(err) {
		return "", errors.New("track file not found")
	}

	return track.FilePath, nil
}

func (s *TrackService) validateFile(file *multipart.FileHeader) error {
	if file.Size > s.config.Storage.MaxFileSize {
		return fmt.Errorf("file too large: %d bytes (max: %d bytes)", file.Size, s.config.Storage.MaxFileSize)
	}

	allowedTypes := []string{
		"audio/mpeg",
		"audio/mp3",
		"audio/wav",
		"audio/flac",
		"audio/aac",
		"audio/ogg",
	}

	contentType := file.Header.Get("Content-Type")
	isValidType := false
	for _, allowedType := range allowedTypes {
		if contentType == allowedType {
			isValidType = true
			break
		}
	}

	if !isValidType {
		return fmt.Errorf("unsupported file type: %s", contentType)
	}

	return nil
}

func (s *TrackService) saveFile(file *multipart.FileHeader, filePath string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	return err
}

func (s *TrackService) extractMetadata(filename string) (title, artist string) {
	name := strings.TrimSuffix(filename, filepath.Ext(filename))

	if strings.Contains(name, " - ") {
		parts := strings.SplitN(name, " - ", 2)
		if len(parts) == 2 {
			artist = strings.TrimSpace(parts[0])
			title = strings.TrimSpace(parts[1])
			return
		}
	}

	title = name
	artist = "Unknown Artist"
	return
}
