package main

import (
	"log"
	"time"

	"shift-management/config"
	"shift-management/repository"
	"shift-management/service"
	"shift-management/ui"
)

func main() {
	// Initialize Database and AutoMigrate
	config.InitDB()

	// Setup Repositories
	userRepo := repository.NewUserRepository(config.DB)
	shiftRepo := repository.NewShiftRepository(config.DB)
	taskRepo := repository.NewTaskRepository(config.DB)
	settingRepo := repository.NewSettingRepository(config.DB)
	swapRepo := repository.NewShiftSwapRepository(config.DB)

	// Setup Services
	userService := service.NewUserService(userRepo)
	shiftService := service.NewShiftService(shiftRepo)
	taskService := service.NewTaskService(taskRepo, userRepo, shiftRepo, settingRepo)
	settingService := service.NewSettingService(settingRepo)
	authService := service.NewAuthService(userRepo)
	swapService := service.NewShiftSwapService(swapRepo, shiftRepo, userRepo, settingRepo)
	analyticsService := service.NewAnalyticsService(userRepo, shiftRepo)

	healthService := service.NewHealthService(config.DB)

	// Setup UI / API Handlers
	handler := ui.NewHandler(userService, shiftService, taskService, settingService, authService, swapService, analyticsService, healthService)
	router := ui.SetupRouter(handler)

	// Background Auto-Scheduling Job
	go func() {
		for {
			count, err := taskService.AutoScheduleShifts()
			if err == nil && count > 0 {
				log.Printf("Background Job: Auto-scheduled %d shifts based on pending tasks", count)
			}
			time.Sleep(5 * time.Second) // Check every 5 seconds
		}
	}()

	log.Println("Server starting on port 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
