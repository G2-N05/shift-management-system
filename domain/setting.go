package domain

import "gorm.io/gorm"

type SystemSetting struct {
	gorm.Model
	MaxShiftHours       float64 `json:"MaxShiftHours"`
	MinRestHours        float64 `json:"MinRestHours" gorm:"default:11.0"`
	StandardShiftHours  float64 `json:"StandardShiftHours" gorm:"default:4.0"`
	FullShiftHours      float64 `json:"FullShiftHours" gorm:"default:8.0"`
	MaxOvertimeHours    float64 `json:"MaxOvertimeHours" gorm:"default:4.0"`
	MorningShiftStart   string  `json:"MorningShiftStart" gorm:"default:'08:00'"`
	MorningShiftEnd     string  `json:"MorningShiftEnd" gorm:"default:'12:00'"`
	AfternoonShiftStart string  `json:"AfternoonShiftStart" gorm:"default:'13:00'"`
	AfternoonShiftEnd   string  `json:"AfternoonShiftEnd" gorm:"default:'17:00'"`

	// Health-Based Scheduling Rules
	HealthThresholdModerate    int `json:"HealthThresholdModerate" gorm:"default:70"`
	ModerateHealthMaxOTPerWeek int `json:"ModerateHealthMaxOTPerWeek" gorm:"default:1"`
	HealthThresholdLow         int `json:"HealthThresholdLow" gorm:"default:50"`

	// Payroll defaults
	DefaultBaseHourlyRate float64 `json:"DefaultBaseHourlyRate" gorm:"default:20.0"`

	// Company Custom Priority Settings
	PrioritizedHealthConditions string `json:"PrioritizedHealthConditions" gorm:"default:'mang thai,người già'"`
	PriorityConditionDeduction  int    `json:"PriorityConditionDeduction" gorm:"default:50"`
}
