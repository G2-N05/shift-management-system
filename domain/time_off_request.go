package domain

import (
	"time"

	"gorm.io/gorm"
)

// TimeOffStatus represents the status of a leave request
type TimeOffStatus string

const (
	StatusPending  TimeOffStatus = "pending"
	StatusApproved TimeOffStatus = "approved"
	StatusDenied   TimeOffStatus = "denied"
)

// TimeOffRequest represents a request by a user for time off
type TimeOffRequest struct {
	gorm.Model
	UserID        uint          `gorm:"not null;index"`
	StartDate     time.Time     `gorm:"not null"`
	EndDate       time.Time     `gorm:"not null"`
	DurationHours float64       `gorm:"not null;default:8.0"`
	Reason        string        `gorm:"type:text"`
	Status        TimeOffStatus `gorm:"type:varchar(20);default:'pending'"`
}
