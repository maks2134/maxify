package controllers

import (
	"net/http"
	"strconv"

	"maxify/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TrackController struct {
	trackService *services.TrackService
}

func NewTrackController(trackService *services.TrackService) *TrackController {
	return &TrackController{
		trackService: trackService,
	}
}

func (c *TrackController) UploadTrack(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}

	req := &services.UploadTrackRequest{
		File:   file,
		UserID: userUUID,
	}

	response, err := c.trackService.UploadTrack(req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, response)
}

func (c *TrackController) GetUserTracks(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	limit := 20
	offset := 0

	if limitStr := ctx.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	if offsetStr := ctx.Query("offset"); offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	tracks, err := c.trackService.GetUserTracks(userUUID, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"tracks": tracks,
		"limit":  limit,
		"offset": offset,
	})
}

func (c *TrackController) GetTrack(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	trackIDStr := ctx.Param("id")
	trackID, err := uuid.Parse(trackIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid track ID"})
		return
	}

	track, err := c.trackService.GetTrackByID(trackID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	if track.UserID != userUUID {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	ctx.JSON(http.StatusOK, track)
}

func (c *TrackController) DeleteTrack(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	trackIDStr := ctx.Param("id")
	trackID, err := uuid.Parse(trackIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid track ID"})
		return
	}

	if err := c.trackService.DeleteTrack(trackID, userUUID); err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Track deleted successfully"})
}

func (c *TrackController) StreamTrack(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	trackIDStr := ctx.Param("id")
	trackID, err := uuid.Parse(trackIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid track ID"})
		return
	}

	filePath, err := c.trackService.GetTrackFile(trackID, userUUID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.Header("Content-Type", "audio/mpeg")
	ctx.Header("Accept-Ranges", "bytes")
	ctx.Header("Cache-Control", "no-cache")

	ctx.File(filePath)
}
