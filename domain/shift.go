package domain

import (
	"time"

	"gorm.io/gorm"
)

// Shift represents a scheduled work period for a user at a specific location
type Shift struct {
	gorm.Model
	UserID        uint       `gorm:"not null;index"`
	LocationID    uint       `gorm:"not null;index"`
	TaskID        *uint      `gorm:"index"`
	StartTime     time.Time  `gorm:"not null;index"`
	EndTime       time.Time  `gorm:"not null"`
	ClockInTime   *time.Time `gorm:"index"`
	ClockOutTime  *time.Time `gorm:"index"`
	ProofImage    string     `gorm:"type:text"` // Base64 encoded image or path
	Notes         string     `gorm:"type:text"`
	Status        string     `gorm:"type:varchar(20);default:'scheduled'"` // e.g., scheduled, completed, cancelled
}
