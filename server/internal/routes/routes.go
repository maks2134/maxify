package routes

import (
	"maxify/internal/config"
	"maxify/internal/controllers"
	"maxify/internal/middleware"
	"maxify/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(cfg *config.Config) *gin.Engine {
	gin.SetMode(cfg.Server.GinMode)

	router := gin.New()

	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "Range", "Cache-Control", "Pragma"},
		ExposeHeaders:    []string{"Content-Length", "Content-Range", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           86400,
	}
	corsConfig.AllowOriginFunc = func(origin string) bool { return true }
	router.Use(cors.New(corsConfig))

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	authService := services.NewAuthService(cfg)
	userService := services.NewUserService()
	trackService := services.NewTrackService(cfg)
	playlistService := services.NewPlaylistService()
	searchService := services.NewSearchService()

	authController := controllers.NewAuthController(authService)
	userController := controllers.NewUserController(userService)
	trackController := controllers.NewTrackController(trackService)
	playlistController := controllers.NewPlaylistController(playlistService)
	searchController := controllers.NewSearchController(searchService)

	authMiddleware := middleware.AuthMiddleware(authService)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	v1 := router.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authController.Register)
			auth.POST("/login", authController.Login)
			auth.POST("/logout", authMiddleware, authController.Logout)
		}

		users := v1.Group("/users")
		users.Use(authMiddleware)
		{
			users.GET("/profile", userController.GetProfile)
			users.PUT("/profile", userController.UpdateProfile)
			users.DELETE("/profile", userController.DeleteAccount)
			users.GET("/stats", userController.GetUserStats)
		}

		tracks := v1.Group("/tracks")
		tracks.Use(authMiddleware)
		{
			tracks.GET("", trackController.GetUserTracks)
			tracks.GET("/", trackController.GetUserTracks)
			tracks.POST("/upload", trackController.UploadTrack)
			tracks.GET("/:id", trackController.GetTrack)
			tracks.DELETE("/:id", trackController.DeleteTrack)
			tracks.GET("/:id/stream", trackController.StreamTrack)
		}

		playlists := v1.Group("/playlists")
		playlists.Use(authMiddleware)
		{
			playlists.POST("", playlistController.CreatePlaylist)
			playlists.POST("/", playlistController.CreatePlaylist)
			playlists.GET("", playlistController.GetUserPlaylists)
			playlists.GET("/", playlistController.GetUserPlaylists)
			playlists.GET("/:id", playlistController.GetPlaylist)
			playlists.PUT("/:id", playlistController.UpdatePlaylist)
			playlists.DELETE("/:id", playlistController.DeletePlaylist)
			playlists.POST("/:id/tracks", playlistController.AddTrackToPlaylist)
			playlists.DELETE("/:id/tracks/:trackId", playlistController.RemoveTrackFromPlaylist)
		}

		search := v1.Group("/search")
		search.Use(authMiddleware)
		{
			search.GET("", searchController.Search)
			search.GET("/", searchController.Search)
			search.GET("/tracks", searchController.SearchTracks)
			search.GET("/playlists", searchController.SearchPlaylists)
			search.GET("/suggestions", searchController.GetSearchSuggestions)
		}
	}

	return router
}
