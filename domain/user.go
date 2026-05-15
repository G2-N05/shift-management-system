package domain

import (
	"gorm.io/gorm"
)

// Role defines the role of a user in the system
type Role string

const (
	RoleAdmin    Role = "admin"
	RoleManager  Role = "manager"
	RoleEmployee Role = "employee"
)

// User represents an employee or manager in the system
type User struct {
	gorm.Model
	Name            string           `gorm:"type:varchar(100);not null"`
	Email           string           `gorm:"type:varchar(100);uniqueIndex;not null"`
	Username        string           `gorm:"uniqueIndex;not null;default:''"`
	PasswordHash    string           `gorm:"not null;default:''"`
	Phone           string           `gorm:"type:varchar(20)"`
	Role            Role             `gorm:"type:varchar(20);not null;default:'employee'"`
	EnergyScore     int              `gorm:"default:100"`
	SkillLevel      int              `gorm:"not null;default:1"`
	MaxWeeklyHours  int              `gorm:"not null;default:40"`
	Shifts          []Shift          `gorm:"foreignKey:UserID"`
	TimeOffRequests []TimeOffRequest `gorm:"foreignKey:UserID"`
}
