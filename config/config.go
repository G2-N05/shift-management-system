package config

import (
	"log"
	"time"

	"shift-management/domain"
	"golang.org/x/crypto/bcrypt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("shift_management.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Concurrency & Connection Pooling configuration
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get generic database object: %v", err)
	}

	// SetMaxIdleConns sets the maximum number of connections in the idle connection pool.
	sqlDB.SetMaxIdleConns(10)
	// SetMaxOpenConns sets the maximum number of open connections to the database.
	sqlDB.SetMaxOpenConns(100)
	// SetConnMaxLifetime sets the maximum amount of time a connection may be reused.
	sqlDB.SetConnMaxLifetime(time.Hour)

	// AutoMigrate
	err = DB.AutoMigrate(
		&domain.User{},
		&domain.Location{},
		&domain.Shift{},
		&domain.TimeOffRequest{},
		&domain.Task{},
		&domain.SystemSetting{},
		&domain.Notification{},
		&domain.ShiftSwap{},
		&domain.HealthDeclaration{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Create default setting if not exists
	var setting domain.SystemSetting
	if err := DB.First(&setting).Error; err != nil {
		DB.Create(&domain.SystemSetting{
			MaxShiftHours: 8.0,
			MinRestHours:  11.0,
		})
	}
	
	// Seed Admin user if not exists
	var admin domain.User
	if err := DB.Where("username = ?", "admin").First(&admin).Error; err != nil {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		DB.Create(&domain.User{
			Name:         "Administrator",
			Email:        "admin@example.com",
			Username:     "admin",
			PasswordHash: string(hash),
			Role:         "admin",
		})
	}
	
	log.Println("Database connection and migration successful.")
}
