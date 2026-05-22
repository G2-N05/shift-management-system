package domain

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Title              string    `json:"Title" gorm:"type:varchar(255);not null"`
	Description        string    `json:"Description" gorm:"type:text"`
	LocationID         uint      `json:"LocationID"`
	RequiredRole       Role      `json:"RequiredRole" gorm:"type:varchar(20);not null"`
	RequiredSkill      int       `json:"RequiredSkill" gorm:"default:1"`
	Headcount          int       `json:"Headcount" gorm:"default:1"`
	WorkModel          string    `json:"WorkModel" gorm:"type:varchar(20);default:'Parallel'"`
	StartTime          time.Time `json:"StartTime" gorm:"not null"`
	EndTime            time.Time `json:"EndTime" gorm:"not null"`
	IsScheduled        bool      `json:"IsScheduled" gorm:"default:false"`
	IsAssigned         bool      `gorm:"default:false"`
	AssignedTo         *uint     `gorm:"index"` // Nullable, points to UserID if assigned
	UrgencyLevel       string    `json:"UrgencyLevel" gorm:"type:varchar(20);default:'Medium'"`
	CoordinationStatus string    `json:"CoordinationStatus" gorm:"type:varchar(20);default:'Pending'"`
}
