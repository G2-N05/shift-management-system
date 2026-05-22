package domain

import "gorm.io/gorm"

// UserKPI stores the KPI data for an employee for a specific month
type UserKPI struct {
	gorm.Model
	UserID     uint    `json:"UserID" gorm:"not null;index:idx_user_month_year,unique"`
	Month      int     `json:"Month" gorm:"not null;index:idx_user_month_year,unique"`
	Year       int     `json:"Year" gorm:"not null;index:idx_user_month_year,unique"`
	Score      int     `json:"Score" gorm:"not null;default:50"`          // 0-100 score
	Multiplier float64 `json:"Multiplier" gorm:"not null;default:1.0"`    // Bonus multiplier (e.g. 1.2x)
	Notes      string  `json:"Notes" gorm:"type:text"`
}
