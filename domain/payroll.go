package domain

import "gorm.io/gorm"

// PayrollRecord stores the calculated payroll data for an employee for a specific month
type PayrollRecord struct {
	gorm.Model
	UserID     uint    `json:"UserID" gorm:"not null;index:idx_payroll_user_month,unique"`
	Month      int     `json:"Month" gorm:"not null;index:idx_payroll_user_month,unique"`
	Year       int     `json:"Year" gorm:"not null;index:idx_payroll_user_month,unique"`
	TotalHours float64 `json:"TotalHours" gorm:"not null;default:0"`
	BaseRate   float64 `json:"BaseRate" gorm:"not null;default:0"`
	BasePay    float64 `json:"BasePay" gorm:"not null;default:0"`
	BonusPay   float64 `json:"BonusPay" gorm:"not null;default:0"`
	TotalPay   float64 `json:"TotalPay" gorm:"not null;default:0"`
	IsPaid     bool    `json:"IsPaid" gorm:"default:false"`
}
