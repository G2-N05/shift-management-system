package ui

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(handler *Handler) *gin.Engine {
	r := gin.Default()

	// CORS config for frontend
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))

	api := r.Group("/api")
	{
		api.POST("/auth/login", handler.Login)

		protected := api.Group("/")
		protected.Use(AuthMiddleware())
		{
			protected.GET("/users", handler.GetUsers)
			protected.POST("/users", handler.CreateUser)
			protected.PUT("/users/:id", handler.UpdateUser)
			protected.DELETE("/users/:id", handler.DeleteUser)
			
			protected.GET("/shifts", handler.GetShifts)
			protected.POST("/shifts", handler.CreateShift)
			protected.PUT("/shifts/:id", handler.UpdateShift)
			protected.DELETE("/shifts/:id", handler.DeleteShift)
			protected.POST("/shifts/:id/clock-in", handler.ClockIn)
			protected.POST("/shifts/:id/clock-out", handler.ClockOut)
			
			protected.GET("/tasks", handler.GetTasks)
			protected.POST("/tasks", handler.CreateTask)
			protected.PUT("/tasks/:id", handler.UpdateTask)
			protected.DELETE("/tasks/:id", handler.DeleteTask)
			protected.POST("/tasks/auto-schedule", handler.AutoSchedule)
			
			protected.GET("/settings", handler.GetSetting)
			protected.PUT("/settings", handler.UpdateSetting)

			protected.GET("/swaps", handler.GetPendingSwaps)
			protected.POST("/swaps", handler.RequestSwap)
			protected.POST("/swaps/:id/approve", handler.ApproveSwap)
			protected.POST("/swaps/:id/reject", handler.RejectSwap)
			protected.POST("/swaps/auto", handler.AutoSwapRequest)

			protected.GET("/analytics/attrition", handler.GetAttritionRisks)
			protected.GET("/analytics/backups/:id", handler.GetBackupSuggestions)
		}
	}

	return r
}
