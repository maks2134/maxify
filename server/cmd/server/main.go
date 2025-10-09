package main

import (
	"log"
	"os"

	"maxify/internal/config"
	"maxify/internal/database"
	"maxify/internal/routes"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to PostgreSQL
	if err := database.ConnectPostgres(cfg); err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}

	// Connect to Redis
	if err := database.ConnectRedis(cfg); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(cfg.Storage.UploadDir, 0755); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}

	// Setup routes
	router := routes.SetupRoutes(cfg)

	// Start server
	log.Printf("Starting server on port %s", cfg.Server.Port)
	if err := router.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
